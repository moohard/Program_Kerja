<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::table('rencana_aksi', function (Blueprint $table)
        {
            $table->index([ 'kegiatan_id' ], 'idx_rencana_aksi_kegiatan');
        });

        Schema::table('kegiatan', function (Blueprint $table)
        {
            $table->index([ 'kategori_id' ], 'idx_kegiatan_kategori');
        });

        Schema::table('progress_monitoring', function (Blueprint $table)
        {
            $table->index([ 'rencana_aksi_id', 'tanggal_monitoring' ], 'idx_progress_monitoring');
        });

        Schema::table('rencana_aksi', function (Blueprint $table)
        {
            $table->index([ 'status' ], 'idx_rencana_aksi_status');
        });

        Schema::table('kategori_utama', function (Blueprint $table)
        {
            $table->index([ 'program_kerja_id' ], 'idx_kategori_program');
        });

        Schema::table('todo_items', function (Blueprint $table)
        {
            $table->index([ 'rencana_aksi_id', 'completed', 'deadline' ], 'idx_todo_items');
        });
    }

    public function down()
    {

        // Drop indexes jika diperlukan
    }

};
