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
        // 1. Buat tabel baru untuk attachment to-do item
        Schema::create('todo_item_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('todo_item_id')->constrained('todo_items')->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type')->nullable();
            $table->unsignedInteger('file_size')->nullable();
            $table->timestamps();
        });

        // 2. Hapus tabel progress_attachments yang lama
        Schema::dropIfExists('progress_attachments');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Buat kembali tabel progress_attachments jika di-rollback
        Schema::create('progress_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('progress_monitoring_id')->constrained('progress_monitoring')->onDelete('cascade');
            $table->string('file_path');
            $table->string('original_name');
            $table->timestamps();
        });

        // 2. Hapus tabel todo_item_attachments
        Schema::dropIfExists('todo_item_attachments');
    }
};