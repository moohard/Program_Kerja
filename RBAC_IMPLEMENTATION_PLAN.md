# Rencana Implementasi Role-Based Access Control (RBAC) - (FINAL)

Dokumen ini menguraikan langkah-langkah teknis untuk mengimplementasikan sistem Role-Based Access Control (RBAC) yang formal. Rencana ini mendukung **penugasan banyak peran (role) ke satu pengguna** dan memisahkan dengan jelas antara fungsi Jabatan dan Role.

## 1. Konsep & Tujuan Utama

-   **Pemisahan Fungsi**:
    -   **Jabatan**: Menentukan **STRUKTUR ORGANISASI** dan **ALUR PENUGASAN** (siapa melapor ke siapa, siapa bisa menugaskan ke siapa).
    -   **Role**: Menentukan **HAK AKSES FUNGSIONAL** (apa yang bisa dilakukan pengguna di dalam aplikasi).
-   **Multi-Role per User**: Seorang pengguna dapat memiliki lebih dari satu peran untuk mencerminkan tanggung jawab ganda.
-   **Sentralisasi Otorisasi**: Memindahkan semua aturan hak akses ke dalam Laravel Policies yang terpusat.
-   **Fleksibilitas & Skalabilitas**: Memudahkan pengelolaan hak akses seiring berkembangnya aplikasi.

---

## 2. Langkah-langkah Implementasi (Backend)

### Langkah 2.1: Instalasi & Konfigurasi `spatie/laravel-permission`

1.  **Install Package**: Jalankan di direktori `backend`.
    ```bash
    composer require spatie/laravel-permission
    ```
2.  **Publish Konfigurasi & Migrasi**:
    ```bash
    php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
    ```
3.  **Jalankan Migrasi**: Ini akan membuat tabel `roles`, `permissions`, dan tabel-tabel pivot yang diperlukan.
    ```bash
    php artisan migrate
    ```
4.  **Update `User` Model**: Tambahkan trait `HasRoles`.
    ```php
    // app/Models/User.php
    use Spatie\Permission\Traits\HasRoles;

    class User extends Authenticatable
    {
        use HasApiTokens, HasFactory, Notifiable, HasRoles; // Tambahkan HasRoles
        // ...
    }
    ```

### Langkah 2.2: Definisi & Seeding Roles and Permissions

1.  **Buat Seeder**:
    ```bash
    php artisan make:seeder RbacSeeder
    ```
2.  **Isi Seeder**: Definisikan 5 peran utama dan hak akses yang relevan.
    ```php
    // database/seeders/RbacSeeder.php
    use Illuminate\Database\Seeder;
    use Spatie\Permission\Models\Role;
    use Spatie\Permission\Models\Permission;

    class RbacSeeder extends Seeder
    {
        public function run(): void
        {
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            // === DEFINISI PERMISSIONS ===
            Permission::create(['name' => 'manage users']);
            Permission::create(['name' => 'manage jabatan']);
            Permission::create(['name' => 'manage master data']);

            Permission::create(['name' => 'view all data']);
            Permission::create(['name' => 'create rencana aksi']);
            Permission::create(['name' => 'edit rencana aksi']);
            Permission::create(['name' => 'delete rencana aksi']);
            Permission::create(['name' => 'assign rencana aksi']);
            Permission::create(['name' => 'approve todo']);
            Permission::create(['name' => 'upload evidence']);
            Permission::create(['name' => 'manage own todos']);

            // === DEFINISI ROLES & PEMBERIAN PERMISSIONS ===

            // 1. Admin: Semua hak akses
            $adminRole = Role::create(['name' => 'admin']);
            $adminRole->givePermissionTo(Permission::all());

            // 2. Manajer: Pimpinan Bidang
            $manajerRole = Role::create(['name' => 'manajer']);
            $manajerRole->givePermissionTo([
                'create rencana aksi', 'edit rencana aksi', 'delete rencana aksi',
                'assign rencana aksi',
                'approve todo',
                'manage own todos',
                'upload evidence'
            ]);

            // 3. Staff: Eksekutor
            $staffRole = Role::create(['name' => 'staff']);
            $staffRole->givePermissionTo(['manage own todos', 'upload evidence']);

            // 4. Pengawas: Auditor (Read-only)
            $pengawasRole = Role::create(['name' => 'pengawas']);
            $pengawasRole->givePermissionTo('view all data');

            // 5. Operator: Juru Tulis / Input Rencana Aksi
            $operatorRole = Role::create(['name' => 'operator']);
            $operatorRole->givePermissionTo([
                'create rencana aksi',
                'edit rencana aksi',
                'delete rencana aksi',
                'assign rencana aksi'
            ]);
        }
    }
    ```
3.  **Jalankan Seeder**: Panggil dari `DatabaseSeeder.php` dan jalankan `php artisan db:seed`.

### Langkah 2.3: Penugasan Role ke User

Penugasan *role* dilakukan oleh `admin` melalui antarmuka manajemen pengguna.

1.  **Update `UserController`**: Modifikasi metode `store` dan `update` untuk menerima array `roles`.
    ```php
    // UserController.php
    public function update(Request $request, User $user)
    {
        // ... validasi
        $user->update($validatedData);
        
        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return new UserResource($user);
    }
    ```
2.  **Catatan**: Halaman frontend untuk manajemen pengguna perlu di-update untuk mengirim array `roles`.

### Langkah 2.4: Implementasi Laravel Policies

1.  **Buat & Daftarkan Policy**:
    ```bash
    php artisan make:policy RencanaAksiPolicy --model=RencanaAksi
    ```
    Daftarkan di `AuthServiceProvider.php`.

2.  **Gunakan di Controller**: Ganti logika `if-else` dengan `authorize`.
    ```php
    // RencanaAksiController.php
    public function store(StoreRencanaAksiRequest $request)
    {
        $this->authorize('create', RencanaAksi::class);
        // ...
    }
    ```

---

## 3. Langkah-langkah Implementasi (Frontend)

### Langkah 3.1: Kirim Permissions ke Frontend

Saat login, sertakan daftar *permissions* gabungan dari semua *role* milik pengguna.
```php
// AuthController.php -> login()
$permissions = $user->getAllPermissions()->pluck('name'); 
return response()->json([
    'user'  => [ /* ... data user */, 'permissions' => $permissions ],
    'token' => $token,
]);
```

### Langkah 3.2: Buat Hook `usePermissions`

Buat *custom hook* untuk memudahkan pengecekan di komponen React.
```jsx
// hooks/usePermissions.js
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

export const usePermissions = () => {
    const { user } = useContext(AuthContext);
    const permissions = user?.permissions || [];
    const can = (permissionName) => permissions.includes(permissionName);
    return { can };
};
```

### Langkah 3.3: Terapkan di Komponen React

Gunakan *hook* `usePermissions` untuk menampilkan/menyembunyikan elemen UI.
```jsx
// Contoh di RencanaAksiModal.jsx
import { usePermissions } from '../../hooks/usePermissions';
const { can } = usePermissions();
// ...
{can('assign rencana aksi') ? <JabatanSelector ... /> : <input ... readOnly />}
```

---

## 4. Diskusi Lanjutan

-   Bagaimana kita menangani kasus di mana seorang `admin` juga perlu berpartisipasi dalam program kerja? (Jawaban: Tugaskan dia *role* `admin` dan `staff` sekaligus).
-   Apakah ada alur kerja lain yang belum tercakup oleh 5 peran ini?
