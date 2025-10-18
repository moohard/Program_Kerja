<?php

namespace Tests\Unit;

use App\Models\RencanaAksi;
use App\Services\JadwalService;
use Carbon\Carbon;
use Mockery;
use Tests\TestCase;

class JadwalServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * @dataProvider dateScenarios
     */
    public function test_get_applicable_report_date_scenarios($jadwal_tipe, $jadwal_config, $currentDate, $expectedDate): void
    {
        // Create a mock for RencanaAksi
        $rencanaAksiMock = Mockery::mock(RencanaAksi::class);
        $rencanaAksiMock->shouldReceive('getAttribute')->with('jadwal_tipe')->andReturn($jadwal_tipe);
        $rencanaAksiMock->shouldReceive('getAttribute')->with('jadwal_config')->andReturn($jadwal_config);

        $service = new JadwalService();
        $resultDate = $service->getApplicableReportDate($rencanaAksiMock, Carbon::parse($currentDate));

        $this->assertInstanceOf(Carbon::class, $resultDate);
        $this->assertEquals(Carbon::parse($expectedDate)->toDateString(), $resultDate->toDateString());
    }

    public static function dateScenarios(): array
    {
        return [
            'Scenario 1: Periodic (triwulanan), current date is May' => [
                'periodik', // jadwal_tipe
                ['periode' => 'triwulanan'], // jadwal_config
                '2025-05-15', // currentDate
                '2025-06-30', // expectedDate (end of next target month)
            ],
            'Scenario 2: Incidental, target month has passed' => [
                'insidentil',
                ['months' => [2, 4, 6]],
                '2025-10-01',
                '2025-06-30', // expectedDate (end of last target month)
            ],
            'Scenario 3: Incidental, next target month is in the future' => [
                'insidentil',
                ['months' => [8, 10]],
                '2025-05-20',
                '2025-08-31', // expectedDate (end of next target month)
            ],
            'Scenario 4: Rutin (no target months)' => [
                'rutin',
                [],
                '2025-05-10',
                '2025-05-31', // expectedDate (end of current month)
            ],
            'Scenario 5: Bulanan, current month is a target' => [
                'bulanan',
                ['months' => [1, 2, 3, 4, 5, 6]],
                '2025-05-10',
                '2025-05-31', // expectedDate (end of current month as it's a target)
            ],
        ];
    }
}
