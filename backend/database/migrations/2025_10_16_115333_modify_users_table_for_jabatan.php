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
        Schema::table('users', function (Blueprint $table) {
            // Tambah kolom jabatan_id setelah kolom password
            $table->foreignId('jabatan_id')->nullable()->after('password')->constrained('jabatan');

            // Hapus kolom role yang lama
            $table->dropColumn('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Tambahkan kembali kolom role jika rollback
            $table->enum('role', ['admin', 'manajer', 'staff', 'pengawas'])->default('staff')->after('password');

            // Hapus foreign key dan kolom jabatan_id
            $table->dropForeign(['jabatan_id']);
            $table->dropColumn('jabatan_id');
        });
    }
};