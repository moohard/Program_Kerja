<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            // Mengubah enum untuk jadwal_tipe: menambah 'bulanan'
            DB::statement("ALTER TABLE rencana_aksi MODIFY COLUMN jadwal_tipe ENUM('insidentil', 'periodik', 'rutin', 'bulanan') DEFAULT 'insidentil'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            // Mengembalikan ke state sebelumnya jika di-rollback
            DB::statement("ALTER TABLE rencana_aksi MODIFY COLUMN jadwal_tipe ENUM('insidentil', 'periodik', 'rutin') DEFAULT 'insidentil'");
        }
    }
};