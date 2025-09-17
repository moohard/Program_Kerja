<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('todo_items', function (Blueprint $table)
        {
            $table->id();
            $table->foreignId('rencana_aksi_id')->constrained('rencana_aksi')->onDelete('cascade');
            $table->text('deskripsi');
            $table->boolean('completed')->default(FALSE);
            $table->timestamp('deadline')->nullable();
            $table->timestamps();

            $table->index([ 'rencana_aksi_id' ]);
            $table->index([ 'completed' ]);
            $table->index([ 'deadline' ]);
        });
    }

    public function down()
    {

        Schema::dropIfExists('todo_items');
    }

};
