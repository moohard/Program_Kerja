<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('progress_monitoring', function (Blueprint $table) {
            // Menambahkan kolom baru untuk tanggal laporan.
            // Bisa null untuk kompatibilitas data lama.
            // `after('keterangan')` menempatkan kolom ini setelah kolom keterangan.
            $table->date('report_date')->nullable()->after('keterangan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('progress_monitoring', function (Blueprint $table) {
            $table->dropColumn('report_date');
        });
    }
};
