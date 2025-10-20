<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Menambahkan 'not_started' dan mengubah default
        DB::statement("ALTER TABLE todo_items MODIFY COLUMN status_approval ENUM('not_started', 'pending_upload', 'pending_approval', 'approved') NOT NULL DEFAULT 'not_started'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Mengembalikan ke definisi sebelumnya
        DB::statement("ALTER TABLE todo_items MODIFY COLUMN status_approval ENUM('pending_upload', 'pending_approval', 'approved') NOT NULL DEFAULT 'pending_upload'");
    }
};