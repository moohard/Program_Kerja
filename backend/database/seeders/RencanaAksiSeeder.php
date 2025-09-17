<?php

// database/seeders/RencanaAksiSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RencanaAksiSeeder extends Seeder
{

    public function run()
    {

        // Ambil data kegiatan
        $kegiatan = DB::table('kegiatan')
            ->join('kategori_utama', 'kegiatan.kategori_id', '=', 'kategori_utama.id')
            ->join('program_kerja', 'kategori_utama.program_kerja_id', '=', 'program_kerja.id')
            ->where('program_kerja.tahun', 2025)
            ->select('kegiatan.id', 'kegiatan.nama_kegiatan', 'kategori_utama.nomor as kategori_nomor')
            ->get()
            ->groupBy('kategori_nomor');

        // Ambil user IDs untuk penugasan
        $users = DB::table('users')->pluck('id');

        $rencanaAksiData = [
            // Kategori 1: TEKNIS YUSTISIAL
            1  => [
                // Kegiatan 1: Peningkatan kemampuan, keterampilan...
                [
                    'nomor_aksi'     => '1',
                    'deskripsi_aksi' => 'Mengadakan diskusi hukum (Formil dan Materiil) dan kajian teknik membuat putusan',
                    'jadwal_tipe'    => 'periodik',
                    'jadwal_config'  => json_encode([ 'interval' => 'monthly', 'months' => [ 3, 6, 9, 12 ] ]),
                    'priority'       => 'high',
                ],
                [
                    'nomor_aksi'     => '2',
                    'deskripsi_aksi' => 'Mengikutsertakan hakim dalam kegiatan Bimtek yang diadakan oleh PTA Samarinda dan Badilag MA RI',
                    'jadwal_tipe'    => 'insidentil',
                    'priority'       => 'medium',
                ],
                [
                    'nomor_aksi'     => '3',
                    'deskripsi_aksi' => 'Mengikuti eksaminasi yang dilaksanakan oleh Badilag setiap 3 bulan sekali melalui Aplikasi E-Binwas',
                    'jadwal_tipe'    => 'periodik',
                    'jadwal_config'  => json_encode([ 'interval' => 'quarterly' ]),
                    'priority'       => 'high',
                ],
                [
                    'nomor_aksi'     => '4',
                    'deskripsi_aksi' => 'Mengikuti diskusi dan bimbingan tentang ekonomi syariah yang diselenggarakan oleh Badilag dan PTA',
                    'jadwal_tipe'    => 'periodik',
                    'jadwal_config'  => json_encode([ 'interval' => 'monthly', 'months' => [ 2, 5, 8, 11 ] ]),
                    'priority'       => 'medium',
                ],
                [
                    'nomor_aksi'     => '5',
                    'deskripsi_aksi' => 'Mengikutsertakan hakim dalam sertifikasi ekonomi syariah',
                    'jadwal_tipe'    => 'insidentil',
                    'priority'       => 'high',
                ],

                // Kegiatan 2: Peningkatan jumlah penyelesaian perkara melalui mediasi
                [
                    'nomor_aksi'     => '1',
                    'deskripsi_aksi' => 'Menyelenggarakan mediasi yang berkualitas sebagai sarana penyelesaian perkara',
                    'jadwal_tipe'    => 'rutin',
                    'jadwal_config'  => json_encode([ 'frequency' => 'weekly' ]),
                    'priority'       => 'high',
                ],
                [
                    'nomor_aksi'     => '2',
                    'deskripsi_aksi' => 'Menyelenggarakan Diskusi Tentang Prosedur Mediasi Di Pengadilan',
                    'jadwal_tipe'    => 'periodik',
                    'jadwal_config'  => json_encode([ 'interval' => 'quarterly' ]),
                    'priority'       => 'medium',
                ],
            ],

            // Kategori 12: Administrasi Kesekretariatan (Pengelolaan Kepegawaian...)
            12 => [
                // Kegiatan: Tercapainya Peningkatan pelayanan administrasi kepegawaian...
                [
                    'nomor_aksi'     => 'a',
                    'deskripsi_aksi' => 'Mengusulkan penerbitan Karis/Karsu',
                    'jadwal_tipe'    => 'insidentil',
                    'priority'       => 'medium',
                ],
                [
                    'nomor_aksi'     => 'b',
                    'deskripsi_aksi' => 'Menerbitkan SK Kenaikan Gaji Berkala (KGB) (Feb, Mar, Apr,Des)',
                    'jadwal_tipe'    => 'periodik',
                    'jadwal_config'  => json_encode([ 'months' => [ 2, 3, 4, 12 ] ]),
                    'priority'       => 'high',
                ],
                [
                    'nomor_aksi'     => 'c',
                    'deskripsi_aksi' => 'Menerbitkan Surat Pernyataan Masih Menduduki Jabatan(SPMJ)',
                    'jadwal_tipe'    => 'insidentil',
                    'priority'       => 'medium',
                ],
                [
                    'nomor_aksi'     => 'd',
                    'deskripsi_aksi' => 'Menerbitkan Surat Pernyataan Masih Melaksanakan Tugas (SPMT)',
                    'jadwal_tipe'    => 'insidentil',
                    'priority'       => 'medium',
                ],
                [
                    'nomor_aksi'     => 'e',
                    'deskripsi_aksi' => 'Menerbitkan Surat Pernyataan Pelantikan (SPP)',
                    'jadwal_tipe'    => 'insidentil',
                    'priority'       => 'medium',
                ],
                [
                    'nomor_aksi'     => 'f',
                    'deskripsi_aksi' => 'Menerbitkan Surat KP4 Pegawai',
                    'jadwal_tipe'    => 'insidentil',
                    'priority'       => 'medium',
                ],
                [
                    'nomor_aksi'     => 'h',
                    'deskripsi_aksi' => 'Mengusulkan Pegawai calon penerima tanda kehormatan Satya Lencana Karya Satya dalam rangka HUT RI dan HUT MARI',
                    'jadwal_tipe'    => 'periodik',
                    'jadwal_config'  => json_encode([ 'months' => [ 7, 8 ] ]), // Juli-Agustus
                    'priority'       => 'high',
                ],
                [
                    'nomor_aksi'     => 'i',
                    'deskripsi_aksi' => 'Menerbitkan surat izin cuti pegawai dan memproses surat izin cuti Ketua berdasarkan permohonan',
                    'jadwal_tipe'    => 'rutin',
                    'jadwal_config'  => json_encode([ 'frequency' => 'daily' ]),
                    'priority'       => 'medium',
                ],
                [
                    'nomor_aksi'     => 'j',
                    'deskripsi_aksi' => 'Menyiapkan daftar kehadiran, pegawai serta membuat rekap/laporan Absensi pegawai',
                    'jadwal_tipe'    => 'periodik',
                    'jadwal_config'  => json_encode([ 'interval' => 'monthly' ]),
                    'priority'       => 'high',
                ],
                [
                    'nomor_aksi'     => 'k',
                    'deskripsi_aksi' => 'Menerima dan menginput PCK Ke Komdanas',
                    'jadwal_tipe'    => 'periodik',
                    'jadwal_config'  => json_encode([ 'interval' => 'quarterly' ]),
                    'priority'       => 'high',
                ],
                [
                    'nomor_aksi'     => 'l',
                    'deskripsi_aksi' => 'Menerima dan memvalidasi Dokomen evaluasi Kinerja Pegawai',
                    'jadwal_tipe'    => 'periodik',
                    'jadwal_config'  => json_encode([ 'interval' => 'quarterly' ]),
                    'priority'       => 'high',
                ],
                [
                    'nomor_aksi'     => 'm',
                    'deskripsi_aksi' => 'Membuat Usulan Kenaikan Pangkat Pegawai',
                    'jadwal_tipe'    => 'periodik',
                    'jadwal_config'  => json_encode([ 'interval' => 'biannual', 'months' => [ 6, 12 ] ]),
                    'priority'       => 'high',
                ],
            ],
        ];

        $data = [];
        $now  = now();

        foreach ($rencanaAksiData as $kategoriNomor => $aksiList)
        {
            $kegiatanList = $kegiatan[$kategoriNomor] ?? [];

            foreach ($aksiList as $index => $aksi)
            {
                // Assign to a random user
                $assignedTo = $users[rand(0, count($users) - 1)];

                // Set target date based on schedule type
                $targetDate = $this->generateTargetDate($aksi['jadwal_tipe'], $aksi['jadwal_config'] ?? NULL);

                $data[] = [
                    'kegiatan_id'    => $kegiatanList[0]->id, // Assign to first kegiatan in category
                    'nomor_aksi'     => $aksi['nomor_aksi'],
                    'deskripsi_aksi' => $aksi['deskripsi_aksi'],
                    'status'         => 'planned',
                    'target_tanggal' => $targetDate,
                    'assigned_to'    => $assignedTo,
                    'jadwal_tipe'    => $aksi['jadwal_tipe'],
                    'jadwal_config'  => $aksi['jadwal_config'] ?? NULL,
                    'priority'       => $aksi['priority'],
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ];
            }
        }

        DB::table('rencana_aksi')->insert($data);
        $this->command->info('Data rencana aksi berhasil ditambahkan!');
    }

    private function generateTargetDate($scheduleType, $config = NULL)
    {

        $now    = now();
        $config = $config ? json_decode($config, TRUE) : [];

        switch ($scheduleType)
        {
            case 'insidentil':

                // Random date within the year
                return $now->copy()->addDays(rand(30, 300))->format('Y-m-d');

            case 'periodik':
                if (isset($config['months']))
                {
                    // Pick a random month from the configured months
                    $month = $config['months'][array_rand($config['months'])];
                    return $now->copy()->setMonth($month)->setDay(rand(1, 28))->format('Y-m-d');
                } elseif (isset($config['interval']))
                {
                    switch ($config['interval'])
                    {
                        case 'quarterly':
                            $quarter = rand(1, 4);
                            $month = ($quarter * 3) - rand(0, 2);
                            return $now->copy()->setMonth($month)->setDay(rand(1, 28))->format('Y-m-d');
                        case 'monthly':
                            $month = rand(1, 12);
                            return $now->copy()->setMonth($month)->setDay(rand(1, 28))->format('Y-m-d');
                        case 'biannual':
                            $month = rand(0, 1) ? 6 : 12;
                            return $now->copy()->setMonth($month)->setDay(rand(1, 28))->format('Y-m-d');
                    }
                }
                // Fallback
                return $now->copy()->addDays(rand(60, 300))->format('Y-m-d');

            case 'rutin':
                // Regular tasks - set to near future
                return $now->copy()->addDays(rand(7, 30))->format('Y-m-d');

            default:
                return $now->copy()->addDays(rand(30, 180))->format('Y-m-d');
        }
    }

}
