<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Laporan Matriks Program Kerja</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; }
        .category-row { background-color: #e9ecef; font-weight: bold; }
        .kegiatan-row { background-color: #f8f9fa; }
        h1 { text-align: center; }
    </style>
</head>
<body>
    <h1>Laporan Matriks Program Kerja - Tahun {{ $year }}</h1>
    <table>
        <thead>
            <tr>
                <th>Program/Kegiatan/Rencana Aksi</th>
                <th>Penanggung Jawab</th>
                <th>Target</th>
                @for ($i = 1; $i <= 12; $i++)
                    <th>{{ date('M', mktime(0, 0, 0, $i, 1)) }}</th>
                @endfor
            </tr>
        </thead>
        <tbody>
            @foreach ($data as $categoryName => $kegiatans)
                <tr class="category-row">
                    <td colspan="15">{{ $categoryName }}</td>
                </tr>
                @foreach ($kegiatans as $kegiatan)
                    <tr class="kegiatan-row">
                        <td style="padding-left: 20px;">{{ $kegiatan['nama_kegiatan'] }}</td>
                        <td colspan="14"></td>
                    </tr>
                    @foreach ($kegiatan['rencana_aksi'] as $aksi)
                        <tr>
                            <td style="padding-left: 40px;">{{ $aksi['deskripsi_aksi'] }}</td>
                            <td>{{ $aksi['assigned_to']['name'] ?? 'N/A' }}</td>
                            <td>{{ date('d M Y', strtotime($aksi['target_tanggal'])) }}</td>
                            @for ($i = 1; $i <= 12; $i++)
                                <td>{{ $aksi['monthly_progress'][$i] ?? '' }}%</td>
                            @endfor
                        </tr>
                    @endforeach
                @endforeach
            @endforeach
        </tbody>
    </table>
</body>
</html>