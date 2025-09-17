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
        Schema::create('progress_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('progress_monitoring_id')->constrained('progress_monitoring')->onDelete('cascade');
            $table->string('file_name'); // Nama file asli
            $table->string('file_path'); // Path penyimpanan di server
            $table->string('file_type')->nullable(); // misal: 'application/pdf'
            $table->unsignedInteger('file_size')->nullable(); // dalam bytes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress_attachments');
    }
};
