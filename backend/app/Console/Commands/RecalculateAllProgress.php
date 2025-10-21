<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RencanaAksi;
use App\Http\Controllers\Api\TodoItemController;
use Illuminate\Support\Facades\Log;

class RecalculateAllProgress extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:recalculate-all-progress';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate monthly and overall progress for all Rencana Aksi items.';

    /**
     * The TodoItemController instance.
     *
     * @var TodoItemController
     */
    protected $todoController;

    /**
     * Create a new command instance.
     *
     * @param TodoItemController $todoController
     * @return void
     */
    public function __construct(TodoItemController $todoController)
    {
        parent::__construct();
        $this->todoController = $todoController;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting progress recalculation for all Rencana Aksi...');
        Log::info('COMMAND: RecalculateAllProgress started.');

        $rencanaAksis = RencanaAksi::with('todoItems:id,rencana_aksi_id,deadline')->get();
        $bar = $this->output->createProgressBar($rencanaAksis->count());
        $bar->start();

        foreach ($rencanaAksis as $rencanaAksi) {
            // Get all unique months from the deadlines of the todo items
            $months = $rencanaAksi->todoItems
                ->pluck('deadline')
                ->filter()
                ->map(fn($date) => \Carbon\Carbon::parse($date)->month)
                ->unique();

            // Also include unique months from the RencanaAksi's own schedule config
            $jadwalService = app(\App\Services\JadwalService::class);
            $scheduledMonths = $jadwalService->getTargetMonths($rencanaAksi->jadwal_tipe, $rencanaAksi->jadwal_config ?? []);
            
            $allMonths = $months->merge($scheduledMonths)->unique();

            if ($allMonths->isEmpty()) {
                // If no months are found anywhere, still trigger one overall recalculation
                $this->todoController->recalculateProgressPublic($rencanaAksi, 'Recalculated by command (no months).', null);
            } else {
                // Recalculate progress for each relevant month
                foreach ($allMonths as $month) {
                    $note = "Recalculated by command for month {$month}.";
                    $this->todoController->recalculateProgressPublic($rencanaAksi, $note, $month);
                }
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->info("\nRecalculation complete.");
        Log::info('COMMAND: RecalculateAllProgress finished.');

        return 0;
    }
}