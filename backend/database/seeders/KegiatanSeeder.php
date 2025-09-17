<?php

// database/seeders/KegiatanSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KegiatanSeeder extends Seeder
{

    public function run()
    {

        // Ambil ID kategori
        $kategori = DB::table('kategori_utama')
            ->where(
                'program_kerja_id',
                DB::table('program_kerja')->where('tahun', 2025)->value('id'),
            )
            ->get()
            ->keyBy('nomor');

        $kegiatanData = [
            // Kategori 1: TEKNIS YUSTISIAL
            1  => [
                'Peningkatan kemampuan, keterampilan dan professional hakim dalam mewujudkan putusan yang berkeadilan',
                'Peningkatan jumlah penyelesaian perkara melalui mediasi',
            ],

            // Kategori 2: MANAJEMEN PERADILAN
            2  => [
                'Peningkatan Kinerja Organisasi',
                'Peningkatan penyelesaian perkara',
                'Peningkatan kualitas Sumber Daya Manusia (SDM)',
                'Peningkatan kualitas layanan Pengadilan',
                'Peningkatan tertib pengelolaan dan penataan Administrasi Perkara',
                'Penataan sarana ruang tunggu dan perparkiran pengguna layanan hukum',
            ],

            // Kategori 3: PELAKSANAAN REFORMASI BIROKRASI
            3  => [
                'Peningkatan Pelaksanaan Reformasi Birokrasi',
            ],

            // Kategori 4: PEMBANGUNAN ZONA INTEGRITAS
            4  => [
                'Pembangunan Zona Integritas dengan mewujudkan Wilayah Bebas Korupsi (WBK) dan Wilayah Birokrasi Bersih dan Melayani (WBBM)',
                'Mensosialisasikan SPIP kepada seluruh Stakeholder',
                'Sosialisasi pembangunan ZI PA Penajam',
                'Sosialisasi mewujudkan perubahan pola pikir dan budaya kerja aparatur PA Pnj',
                'Monitoring dan Evaluasi Pembangunan ZI',
            ],

            // Kategori 5: PEMBINAAN
            5  => [
                'Peningkatan kualitas aparatur peradilan',
                'Peningkatan kualitas pelaksanaan tugas aparatur peradilan',
            ],

            // Kategori 6: PENGAWASAN
            6  => [
                'Penegakan disiplin aparatur Pengadilan Agama Penajam',
                'Peningkatan pelaksanaan monitoring dan evaluasi kinerja aparatur',
                'Peningkatan efektifitas pengawasan internal',
            ],

            // Kategori 7: LAYANAN PUBLIK
            7  => [
                'Peningkatan Kemampuan Petugas PTSP',
                'Meningkatkan kompetensi petugas kehumasan dan peningkatan layanan informasi',
                'Pengaduan Masyarakat',
                'Peningkatan mutu Pelayanan publik bagi pencari keadilan dan Pengguna layanan melalui Pelayanan Terpadu Satu Pintu (PTSP)',
                'Pos Bantuan Hukum (Posbakum)',
            ],

            // Kategori 8: PELAKSANAAN ADMINISTRASI KEPANITERAAN
            8  => [
                'PENERIMAAN PERKARA TK PERTAMA',
                'PENERIMAAN PERKARA TK BANDING',
                'PENERIMAAN PERKARA TK KASASI',
                'PENERIMAAN PERKARA TK PENINJAUAN KEMBALI',
                'PENDAFTARAN PERMOHONAN EKSEKUSI',
                'ADMINISTRASI KEUANGAN PERKARA',
                'ADMINISTRASI PEMBEBASAN BIAYA PERKARA (PRODEO)',
                'ADMINISTRASI SIDANG DI LUAR GEDUNG PENGADILAN',
                'ADMINISTRASI LAYANAN POS BANTUAN HUKUM',
                'PENYERAHAN PRODUK PENGADILAN',
                'PELAPORAN PERKARA',
            ],

            // Kategori 9: PERSIDANGAN
            9  => [
                'PERSIAPAN PERSIDANGAN',
                'PROSES PERSIDANGAN',
                'PROSES MEDIASI',
                'PUTUSAN',
            ],

            // Kategori 10: Administrasi Kesekretariatan (Pengelolaan Umum dan Keuangan)
            10 => [
                'Peningkatan pelaksanaan pengelolaan tata persuratan dinas',
                'Peningkatan pelaksanaan pengelolaan tata persuratan dinas',
                'Peningkatan Pelaksanaan Pengelolaan Barang Persediaan (ATK)',
                'Pelaksanaan Realisasi Pagu Anggaran',
                'Peningkatan Pengelolaan Inventarisasi BMN',
                'Peningkatan Penatausahaan BMN',
                'Peningkatan Penyelenggaraan Kegiatan Kehumasan dan Keprotokolan Dinas',
                'Peningkatan pengelolaan penganggaran Negara (DIPA) secara tertib dan sesuai peraturan',
            ],

            // Kategori 11: PENGELOLAAN PERENCANAAN, TEKNOLOGI INFORMASI DAN PELAPORAN
            11 => [
                'Peningkatan penyusunan anggaran dan program',
                'Peningkatan monitoring dan evaluasi Program Kerja dan Realisasi Anggaran',
                'Peningkatan Pengelolaan Website Institusi dan Implementasi Teknologi Informasi',
                'Peningkatan Pemeliharaan Sarana Teknologi Infomasi Dan Jaringan Internet',
                'Peningkatan penyusunan dan pembuatan Laporan Institusi',
            ],

            // Kategori 12: Administrasi Kesekretariatan (Pengelolaan Kepegawaian Organisasi dan Tatalaksana)
            12 => [
                'Tercapainya Peningkatan pemahaman peraturan perundang-undangan bidang kepegawaian dan ortala',
                'Tercapainya Peningkatan pengelolaan data dan Informasi Kepegawaian',
                'Tercapainya Peningkatan pembinaan dan pengawasan disiplin pegawai',
                'Tercapainya Peningkatan pengembangan karier pegawai',
                'Tercapainya Peningkatan pelayanan administrasi kepegawaian dan kesejahteraan pegawai',
            ],
        ];

        $data = [];
        foreach ($kegiatanData as $kategoriNomor => $kegiatanList)
        {
            foreach ($kegiatanList as $kegiatanNama)
            {
                $data[] = [
                    'kategori_id'   => $kategori[$kategoriNomor]->id,
                    'nama_kegiatan' => $kegiatanNama,
                    'is_active'     => TRUE,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ];
            }
        }

        DB::table('kegiatan')->insert($data);
        $this->command->info('Data kegiatan berhasil ditambahkan!');
    }

}
