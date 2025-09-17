<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('program_kerja', function (Blueprint $table)
        {
            $table->id();
            $table->year('tahun');
            $table->string('nama_pengadilan', 100)->default('Pengadilan Agama Penajam');
            $table->boolean('is_aktif')->default(FALSE);
            $table->timestamps();

            $table->index('tahun');
            $table->index('is_aktif');
        });
    }

    public function down()
    {

        Schema::dropIfExists('program_kerja');
    }

};
