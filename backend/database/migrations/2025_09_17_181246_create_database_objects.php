<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {

    public function up()
    {

        // 1. CREATE VIEW
        $this->createViews();

        // 2. CREATE STORED PROCEDURE
        $this->createStoredProcedures();

        // 3. CREATE FUNCTION
        $this->createFunctions();

        // 4. CREATE EVENT SCHEDULER
        $this->createEventScheduler();

    }

    public function down()
    {

        // Drop semua objects dalam urutan yang benar
        DB::statement('DROP EVENT IF EXISTS ev_check_overdue_tasks');
        DB::statement('DROP FUNCTION IF EXISTS fn_count_overdue_tasks');
        DB::statement('DROP PROCEDURE IF EXISTS sp_update_progress');
        DB::statement('DROP VIEW IF EXISTS vw_program_kerja_detail');

        // Hapus index tambahan (jika perlu)
    }

    private function createViews()
    {

        $viewSql = <<<SQL
CREATE VIEW vw_program_kerja_detail AS
SELECT
    p.tahun,
    p.nama_pengadilan,
    kt.nomor as kategori_nomor,
    kt.nama_kategori,
    kg.nama_kegiatan,
    ra.nomor_aksi,
    ra.deskripsi_aksi,
    ra.status,
    ra.target_tanggal,
    ra.actual_tanggal,
    ra.jadwal_tipe,
    ra.priority,
    u.name as assigned_to_name,
    COALESCE(pm.progress_percentage, 0) as progress_terakhir,
    pm.tanggal_monitoring as last_progress_date,
    (SELECT COUNT(*) FROM todo_items WHERE rencana_aksi_id = ra.id) as total_todos,
    (SELECT COUNT(*) FROM todo_items WHERE rencana_aksi_id = ra.id AND completed = TRUE) as completed_todos
FROM program_kerja p
JOIN kategori_utama kt ON p.id = kt.program_kerja_id
JOIN kegiatan kg ON kt.id = kg.kategori_id
JOIN rencana_aksi ra ON kg.id = ra.kegiatan_id
LEFT JOIN users u ON ra.assigned_to = u.id
LEFT JOIN (
    SELECT rencana_aksi_id, MAX(tanggal_monitoring) as max_date
    FROM progress_monitoring
    GROUP BY rencana_aksi_id
) latest ON ra.id = latest.rencana_aksi_id
LEFT JOIN progress_monitoring pm ON latest.rencana_aksi_id = pm.rencana_aksi_id
    AND latest.max_date = pm.tanggal_monitoring
WHERE p.is_aktif = TRUE AND kt.is_active = TRUE AND kg.is_active = TRUE
ORDER BY kt.nomor, kg.id, ra.nomor_aksi;
SQL;

        DB::statement($viewSql);
    }

    private function createStoredProcedures()
    {

        $procedureSql = <<<SQL
DROP PROCEDURE IF EXISTS sp_update_progress;
SQL;

        DB::statement($procedureSql);

        $procedureSql = <<<SQL
CREATE PROCEDURE sp_update_progress(
    IN p_rencana_aksi_id INT,
    IN p_progress INT,
    IN p_keterangan TEXT,
    IN p_user_id INT
)
BEGIN
    DECLARE current_status ENUM('planned', 'in_progress', 'completed', 'delayed');

    -- Insert progress monitoring
    INSERT INTO progress_monitoring (rencana_aksi_id, progress_percentage, keterangan, tanggal_monitoring)
    VALUES (p_rencana_aksi_id, p_progress, p_keterangan, CURDATE());

    -- Determine new status
    IF p_progress = 100 THEN
        SET current_status = 'completed';
    ELSEIF p_progress > 0 THEN
        SET current_status = 'in_progress';
    ELSE
        SET current_status = 'planned';
    END IF;

    -- Update status and actual date if completed
    UPDATE rencana_aksi
    SET
        status = current_status,
        actual_tanggal = CASE WHEN p_progress = 100 THEN CURDATE() ELSE actual_tanggal END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_rencana_aksi_id;

    -- Log the action
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (p_user_id, 'UPDATE', 'rencana_aksi', p_rencana_aksi_id,
            JSON_OBJECT('progress', p_progress, 'status', current_status));
END
SQL;

        DB::statement($procedureSql);
    }

    private function createFunctions()
    {

        $functionSql = <<<SQL
DROP FUNCTION IF EXISTS fn_count_overdue_tasks;
SQL;

        DB::statement($functionSql);

        $functionSql = <<<SQL
CREATE FUNCTION fn_count_overdue_tasks(p_user_id INT)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE task_count INT;

    SELECT COUNT(*) INTO task_count
    FROM rencana_aksi ra
    WHERE ra.assigned_to = p_user_id
    AND ra.status != 'completed'
    AND ra.target_tanggal < CURDATE();

    RETURN task_count;
END
SQL;

        DB::statement($functionSql);
    }

    private function createEventScheduler()
    {

        // Pastikan event scheduler aktif di MySQL
        DB::statement("SET GLOBAL event_scheduler = ON;");

        $eventSql = <<<SQL
DROP EVENT IF EXISTS ev_check_overdue_tasks;
SQL;

        DB::statement($eventSql);

        $eventSql = <<<SQL
CREATE EVENT ev_check_overdue_tasks
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE
DO
BEGIN
    UPDATE rencana_aksi
    SET status = 'delayed'
    WHERE status IN ('planned', 'in_progress')
    AND target_tanggal < CURDATE();
END
SQL;

        DB::statement($eventSql);
    }

};
