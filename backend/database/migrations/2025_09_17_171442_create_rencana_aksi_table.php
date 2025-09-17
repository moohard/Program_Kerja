<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('rencana_aksi', function (Blueprint $table)
        {
            $table->id();
            $table->foreignId('kegiatan_id')->constrained('kegiatan')->onDelete('cascade');
            $table->string('nomor_aksi', 10)->nullable();
            $table->text('deskripsi_aksi');
            $table->enum('status', [ 'planned', 'in_progress', 'completed', 'delayed' ])->default('planned');
            $table->date('target_tanggal')->nullable();
            $table->date('actual_tanggal')->nullable();
            $table->text('catatan')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('jadwal_tipe', [ 'insidentil', 'periodik', 'rutin' ])->default('insidentil');
            $table->json('jadwal_config')->nullable();
            $table->enum('priority', [ 'low', 'medium', 'high' ])->default('medium');
            $table->timestamps();

            $table->index([ 'kegiatan_id' ]);
            $table->index([ 'status' ]);
            $table->index([ 'assigned_to' ]);
            $table->index([ 'jadwal_tipe' ]);
            $table->index([ 'priority' ]);
        });
    }

    public function down()
    {

        Schema::dropIfExists('rencana_aksi');
    }

};
