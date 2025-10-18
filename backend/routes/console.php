<?php

use App\Console\Commands\GenerateMonthlyMatrixReport;
use App\Console\Commands\SendDeadlineReminders;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Menjadwalkan perintah pengingat deadline untuk berjalan setiap hari pukul 08:00
Schedule::command(SendDeadlineReminders::class)->dailyAt('08:00');

// Menjadwalkan pembuatan laporan matriks bulanan
Schedule::command(GenerateMonthlyMatrixReport::class)->monthlyOn(1, '01:00');