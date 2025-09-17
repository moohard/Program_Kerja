<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('progress_monitoring', function (Blueprint $table)
        {
            $table->id();
            $table->foreignId('rencana_aksi_id')->constrained('rencana_aksi')->onDelete('cascade');
            $table->integer('progress_percentage')->check('progress_percentage >= 0 AND progress_percentage <= 100');
            $table->text('keterangan')->nullable();
            $table->date('tanggal_monitoring');
            $table->timestamps();

            $table->index([ 'rencana_aksi_id' ]);
            $table->index([ 'tanggal_monitoring' ]);
        });
    }

    public function down()
    {

        Schema::dropIfExists('progress_monitoring');
    }

};
