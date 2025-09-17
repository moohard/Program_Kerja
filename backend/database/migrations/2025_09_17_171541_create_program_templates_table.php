<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('program_templates', function (Blueprint $table)
        {
            $table->id();
            $table->string('nama_template', 255);
            $table->year('tahun_referensi')->nullable();
            $table->boolean('is_default')->default(FALSE);
            $table->timestamps();

            $table->index([ 'tahun_referensi' ]);
        });
    }

    public function down()
    {

        Schema::dropIfExists('program_templates');
    }

};
