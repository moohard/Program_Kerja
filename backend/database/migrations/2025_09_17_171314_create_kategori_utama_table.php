<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('kategori_utama', function (Blueprint $table)
        {
            $table->id();
            $table->foreignId('program_kerja_id')->constrained('program_kerja')->onDelete('cascade');
            $table->integer('nomor');
            $table->string('nama_kategori', 255);
            $table->boolean('is_active')->default(TRUE);
            $table->timestamps();

            $table->index([ 'program_kerja_id' ]);
            $table->index([ 'nomor' ]);
        });
    }

    public function down()
    {

        Schema::dropIfExists('kategori_utama');
    }

};
