-- Buat database
CREATE DATABASE IF NOT EXISTS program_kerja_pa_penajam;
USE program_kerja_pa_penajam;

-- Tabel users untuk authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manajer', 'staff', 'pengawas') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel program_kerja (mendukung multi-tahun)
CREATE TABLE program_kerja (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tahun YEAR NOT NULL,
    nama_pengadilan VARCHAR(100) NOT NULL DEFAULT 'Pengadilan Agama Penajam',
    is_aktif BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tahun (tahun),
    INDEX idx_aktif (is_aktif)
);

-- Tabel kategori_utama
CREATE TABLE kategori_utama (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_kerja_id INT NOT NULL,
    nomor INT NOT NULL,
    nama_kategori VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_kerja_id) REFERENCES program_kerja(id) ON DELETE CASCADE,
    INDEX idx_program_kerja (program_kerja_id),
    INDEX idx_nomor (nomor)
);

-- Tabel kegiatan
CREATE TABLE kegiatan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kategori_id INT NOT NULL,
    nama_kegiatan TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori_utama(id) ON DELETE CASCADE,
    INDEX idx_kategori (kategori_id)
);

-- Tabel rencana_aksi (dengan sistem penjadwalan)
CREATE TABLE rencana_aksi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kegiatan_id INT NOT NULL,
    nomor_aksi VARCHAR(10),
    deskripsi_aksi TEXT NOT NULL,
    status ENUM('planned', 'in_progress', 'completed', 'delayed') DEFAULT 'planned',
    target_tanggal DATE,
    actual_tanggal DATE,
    catatan TEXT,
    assigned_to INT,
    jadwal_tipe ENUM('insidentil', 'periodik', 'rutin') DEFAULT 'insidentil',
    jadwal_config JSON, -- Untuk menyimpan konfigurasi jadwal
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kegiatan_id) REFERENCES kegiatan(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_kegiatan (kegiatan_id),
    INDEX idx_status (status),
    INDEX idx_assigned (assigned_to),
    INDEX idx_jadwal_tipe (jadwal_tipe),
    INDEX idx_priority (priority)
);

-- Tabel to-do items untuk rencana aksi
CREATE TABLE todo_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rencana_aksi_id INT NOT NULL,
    deskripsi TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    deadline TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rencana_aksi_id) REFERENCES rencana_aksi(id) ON DELETE CASCADE,
    INDEX idx_rencana_aksi (rencana_aksi_id),
    INDEX idx_completed (completed),
    INDEX idx_deadline (deadline)
);

-- Tabel progress monitoring
CREATE TABLE progress_monitoring (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rencana_aksi_id INT NOT NULL,
    progress_percentage INT CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    keterangan TEXT,
    tanggal_monitoring DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rencana_aksi_id) REFERENCES rencana_aksi(id) ON DELETE CASCADE,
    INDEX idx_rencana_aksi (rencana_aksi_id),
    INDEX idx_tanggal (tanggal_monitoring)
);

-- Tabel audit log
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_table (table_name),
    INDEX idx_record (record_id),
    INDEX idx_created (created_at)
);

-- Tabel template program kerja
CREATE TABLE program_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_template VARCHAR(255) NOT NULL,
    tahun_referensi YEAR,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tahun (tahun_referensi)
);

-- Tabel template details
CREATE TABLE template_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_id INT NOT NULL,
    kategori_utama_id INT,
    kegiatan_id INT,
    rencana_aksi_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES program_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (kategori_utama_id) REFERENCES kategori_utama(id) ON DELETE SET NULL,
    FOREIGN KEY (kegiatan_id) REFERENCES kegiatan(id) ON DELETE SET NULL,
    FOREIGN KEY (rencana_aksi_id) REFERENCES rencana_aksi(id) ON DELETE SET NULL,
    INDEX idx_template (template_id)
);

-- Insert user admin default
INSERT INTO users (name, email, password, role) VALUES
('Administrator', 'admin@pa-penajam.go.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'); -- password is "password"

-- Insert program kerja untuk tahun 2025
INSERT INTO program_kerja (tahun, nama_pengadilan, is_aktif) VALUES
(2025, 'Pengadilan Agama Penajam', TRUE);

-- View untuk monitoring progress
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

-- Stored procedure untuk update progress
DELIMITER //

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
END //

DELIMITER ;

-- Function untuk menghitung overdue tasks
DELIMITER //

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
END //

DELIMITER ;

-- Index untuk optimasi performa
CREATE INDEX idx_rencana_aksi_kegiatan ON rencana_aksi(kegiatan_id);
CREATE INDEX idx_kegiatan_kategori ON kegiatan(kategori_id);
CREATE INDEX idx_progress_monitoring ON progress_monitoring(rencana_aksi_id, tanggal_monitoring);
CREATE INDEX idx_rencana_aksi_status ON rencana_aksi(status);
CREATE INDEX idx_kategori_program ON kategori_utama(program_kerja_id);
CREATE INDEX idx_todo_items ON todo_items(rencana_aksi_id, completed, deadline);

-- Event scheduler untuk update status overdue (jalan setiap hari jam 00:00)
DELIMITER //

CREATE EVENT ev_check_overdue_tasks
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE
DO
BEGIN
    UPDATE rencana_aksi 
    SET status = 'delayed'
    WHERE status IN ('planned', 'in_progress')
    AND target_tanggal < CURDATE();
END //

DELIMITER ;

-- Query contoh untuk monitoring
SELECT 
    kt.nomor as kategori_nomor,
    kt.nama_kategori,
    COUNT(ra.id) as total_aksi,
    SUM(CASE WHEN ra.status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN ra.status = 'delayed' THEN 1 ELSE 0 END) as delayed,
    ROUND((SUM(CASE WHEN ra.status = 'completed' THEN 1 ELSE 0 END) / COUNT(ra.id)) * 100, 2) as completion_rate
FROM kategori_utama kt
JOIN kegiatan kg ON kt.id = kg.kategori_id
JOIN rencana_aksi ra ON kg.id = ra.kegiatan_id
WHERE kt.program_kerja_id = (SELECT id FROM program_kerja WHERE is_aktif = TRUE)
GROUP BY kt.id, kt.nomor, kt.nama_kategori
ORDER BY kt.nomor;