<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('todo_items', function (Blueprint $table) {
            $table->unsignedTinyInteger('bobot')->default(100)->after('deadline');
            $table->unsignedTinyInteger('progress_percentage')->default(0)->after('bobot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('todo_items', function (Blueprint $table) {
            $table->dropColumn(['bobot', 'progress_percentage']);
        });
    }
};