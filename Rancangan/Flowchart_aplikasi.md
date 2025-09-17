flowchart TD
    A[Login] --> B{Dashboard}
    B --> C[Master Data]
    B --> D[Rencana Aksi]
    B --> E[Progress Tracking]
    B --> F[Reporting]
    B --> G[Settings/Profile]
    
    C --> C1[Kategori Utama]
    C --> C2[Kegiatan]
    C --> C3[Users & Roles]
    C --> C4[Template Management]
    
    D --> D1[List Rencana Aksi]
    D --> D2[Tambah/Edit Rencana]
    D --> D3[To-Do List Management]
    D --> D4[Jadwal & Penugasan]
    
    E --> E1[Input Progress]
    E --> E2[Progress History]
    E --> E3[Monitoring]
    
    F --> F1[Laporan Bulanan]
    F --> F2[Laporan Tahunan]
    F --> F3[Export PDF/Excel]
    
    G --> G1[Profile Settings]
    G --> G2[Manajemen Tahun]
    G --> G3[Archive Data]
    
    subgraph ScheduleSystem
        H[Jadwal Insidentil] --> H1[Karis/Karsu<br>Jan-Des]
        I[Jadwal Periodik] --> I1[Update Database<br>Tiap Akhir Triwulan]
        J[Jadwal Rutin] --> J1[Apel Senin<br>Setiap Minggu]
    end
    
    D4 --> ScheduleSystem