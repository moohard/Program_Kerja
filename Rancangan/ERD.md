erDiagram
    PROGRAM_KERJA {
        int id PK
        year tahun
        varchar nama_pengadilan
        boolean is_aktif
        timestamp created_at
        timestamp updated_at
    }
    
    KATEGORI_UTAMA {
        int id PK
        int program_kerja_id FK
        int nomor
        varchar nama_kategori
        boolean is_active
        timestamp created_at
    }
    
    KEGIATAN {
        int id PK
        int kategori_id FK
        text nama_kegiatan
        boolean is_active
        timestamp created_at
    }
    
    RENCANA_AKSI {
        int id PK
        int kegiatan_id FK
        varchar nomor_aksi
        text deskripsi_aksi
        enum status
        date target_tanggal
        date actual_tanggal
        text catatan
        int assigned_to FK
        enum jadwal_tipe
        varchar jadwal_config
        int priority
        timestamp created_at
    }
    
    TODO_ITEM {
        int id PK
        int rencana_aksi_id FK
        text deskripsi
        boolean completed
        timestamp deadline
        timestamp created_at
    }
    
    PROGRESS_MONITORING {
        int id PK
        int rencana_aksi_id FK
        int progress_percentage
        text keterangan
        date tanggal_monitoring
        timestamp created_at
    }
    
    USERS {
        int id PK
        varchar name
        varchar email
        varchar password
        varchar role
        boolean is_active
        timestamp created_at
    }
    
    AUDIT_LOG {
        int id PK
        int user_id FK
        varchar action
        varchar table_name
        int record_id
        text old_values
        text new_values
        timestamp created_at
    }
    
    PROGRAM_TEMPLATE {
        int id PK
        varchar nama_template
        year tahun_referensi
        boolean is_default
        timestamp created_at
    }
    
    PROGRAM_KERJA ||--o{ KATEGORI_UTAMA : contains
    KATEGORI_UTAMA ||--o{ KEGIATAN : contains
    KEGIATAN ||--o{ RENCANA_AKSI : contains
    RENCANA_AKSI ||--o{ TODO_ITEM : has
    RENCANA_AKSI ||--o{ PROGRESS_MONITORING : tracks
    RENCANA_AKSI }|--|| USERS : assigned_to
    USERS ||--o{ AUDIT_LOG : performs
    PROGRAM_TEMPLATE }|--|| PROGRAM_KERJA : based_on