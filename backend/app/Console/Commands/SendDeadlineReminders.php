<?php

namespace App\Console\Commands;

use App\Models\RencanaAksi;
use App\Notifications\DeadlineReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class SendDeadlineReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-deadline-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mencari rencana aksi yang mendekati deadline dan mengirimkan notifikasi pengingat.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Mulai mengirim notifikasi pengingat deadline...');

        $reminderDays = [1, 3]; // Kirim pengingat 1 dan 3 hari sebelum deadline
        $count = 0;

        foreach ($reminderDays as $days) {
            $targetDate = Carbon::now()->addDays($days)->startOfDay();

            $rencanaAksis = RencanaAksi::with('assignedTo')
                ->whereDate('target_tanggal', '=', $targetDate)
                ->where('status', '!=', 'completed') // Hanya untuk yang belum selesai
                ->get();

            if ($rencanaAksis->isEmpty()) {
                $this->line("Tidak ada Rencana Aksi dengan deadline {$days} hari dari sekarang.");
                continue;
            }

            foreach ($rencanaAksis as $rencanaAksi) {
                if ($rencanaAksi->assignedTo) {
                    try {
                        $rencanaAksi->assignedTo->notify(new DeadlineReminderNotification($rencanaAksi));
                        $this->info("Notifikasi terkirim ke {$rencanaAksi->assignedTo->name} untuk tugas '{$rencanaAksi->deskripsi_aksi}'.");
                        $count++;
                    } catch (\Exception $e) {
                        Log::error("Gagal mengirim notifikasi deadline untuk rencana_aksi_id: {$rencanaAksi->id}. Error: " . $e->getMessage());
                        $this->error("Gagal mengirim notifikasi untuk tugas '{$rencanaAksi->deskripsi_aksi}'. Cek log.");
                    }
                }
            }
        }

        $this->info("Total {$count} notifikasi pengingat berhasil dikirim.");
        Log::info("Scheduler Pengingat Deadline: Total {$count} notifikasi terkirim.");

        return 0;
    }
}
