<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Tahunan Program Kerja</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            color: #333;
        }
        .container {
            width: 100%;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 14px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .summary-box {
            display: inline-block;
            width: 22%;
            padding: 15px;
            margin: 1%;
            text-align: center;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .summary-box .value {
            font-size: 28px;
            font-weight: bold;
            display: block;
        }
        .summary-box .label {
            font-size: 14px;
            color: #555;
            text-transform: capitalize;
        }
        .progress-bar-container {
            width: 100%;
            background-color: #e0e0e0;
            border-radius: 5px;
            height: 20px;
        }
        .progress-bar {
            background-color: #4CAF50;
            height: 20px;
            line-height: 20px;
            color: white;
            text-align: center;
            border-radius: 5px;
        }
        .footer {
            position: fixed;
            bottom: -30px;
            left: 0;
            right: 0;
            height: 50px;
            text-align: center;
            font-size: 10px;
            color: #777;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="footer">
        Laporan Tahunan Program Kerja - Dicetak pada {{ date('d M Y H:i') }}
    </div>

    <div class="container">
        <div class="header">
            <h1>Laporan Ringkasan Tahunan</h1>
            <p>Program Kerja Tahun {{ $programKerja->tahun }}</p>
        </div>

        <div class="section">
            <h2 class="section-title">Ringkasan Status</h2>
            <div style="text-align: center;">
                @php
                    $total = $summary->sum();
                    $status_list = ['planned', 'in_progress', 'completed', 'overdue'];
                @endphp
                @foreach($status_list as $status)
                    <div class="summary-box">
                        <span class="value">{{ $summary[$status] ?? 0 }}</span>
                        <span class="label">{{ str_replace('_', ' ', $status) }}</span>
                    </div>
                @endforeach
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Rata-rata Progres per Kategori</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70%;">Nama Kategori</th>
                        <th style="width: 30%;">Rata-rata Progres</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($progressByCategory as $progress)
                        <tr>
                            <td>{{ $progress['category_name'] }}</td>
                            <td>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: {{ $progress['average_progress'] }}%;">
                                        {{ $progress['average_progress'] }}%
                                    </div>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="2" style="text-align: center;">Tidak ada data progres.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2 class="section-title">Highlight Pencapaian (Prioritas Tinggi Selesai)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Kegiatan</th>
                        <th>Deskripsi Rencana Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($highlights as $highlight)
                        <tr>
                            <td>{{ $highlight->kegiatan->nama_kegiatan }}</td>
                            <td>{{ $highlight->deskripsi_aksi }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="2" style="text-align: center;">Tidak ada pencapaian prioritas tinggi yang selesai.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

    </div>
</body>
</html>
