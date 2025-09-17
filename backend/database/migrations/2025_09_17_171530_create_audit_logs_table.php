<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('audit_logs', function (Blueprint $table)
        {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action', 50);
            $table->string('table_name', 50);
            $table->integer('record_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->timestamps();

            $table->index([ 'user_id' ]);
            $table->index([ 'table_name' ]);
            $table->index([ 'record_id' ]);
            $table->index([ 'created_at' ]);
        });
    }

    public function down()
    {

        Schema::dropIfExists('audit_logs');
    }

};
