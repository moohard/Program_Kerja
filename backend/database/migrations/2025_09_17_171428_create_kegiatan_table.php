<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('kegiatan', function (Blueprint $table)
        {
            $table->id();
            $table->foreignId('kategori_id')->constrained('kategori_utama')->onDelete('cascade');
            $table->text('nama_kegiatan');
            $table->boolean('is_active')->default(TRUE);
            $table->timestamps();

            $table->index([ 'kategori_id' ]);
        });
    }

    public function down()
    {

        Schema::dropIfExists('kegiatan');
    }

};
