<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('template_details', function (Blueprint $table)
        {
            $table->id();
            $table->foreignId('template_id')->constrained('program_templates')->onDelete('cascade');
            $table->foreignId('kategori_utama_id')->nullable()->constrained('kategori_utama')->onDelete('set null');
            $table->foreignId('kegiatan_id')->nullable()->constrained('kegiatan')->onDelete('set null');
            $table->foreignId('rencana_aksi_id')->nullable()->constrained('rencana_aksi')->onDelete('set null');
            $table->timestamps();

            $table->index([ 'template_id' ]);
        });
    }

    public function down()
    {

        Schema::dropIfExists('template_details');
    }

};
