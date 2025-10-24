import { lazy } from 'react';

// Project Pages
const DashboardPage = lazy(() => import('@/app/(admin)/(pages)/dashboard'));
const RencanaAksiPage = lazy(() => import('@/app/(admin)/(pages)/rencana-aksi'));
const LaporanBulananPage = lazy(() => import('@/app/(admin)/(pages)/laporan/bulanan'));
const LaporanMatriksPage = lazy(() => import('@/app/(admin)/(pages)/laporan/matriks'));
const LaporanTahunanPage = lazy(() => import('@/app/(admin)/(pages)/laporan/tahunan'));
const KategoriUtamaPage = lazy(() => import('@/app/(admin)/(pages)/master/kategori-utama'));
const KegiatanPage = lazy(() => import('@/app/(admin)/(pages)/master/kegiatan'));
const JabatanPage = lazy(() => import('@/app/(admin)/(pages)/master/jabatan'));
const UserPage = lazy(() => import('@/app/(admin)/(pages)/master/users'));
const TemplateManagementPage = lazy(() => import('@/app/(admin)/(pages)/templates'));
const AuditLogPage = lazy(() => import('@/app/(admin)/(pages)/audit-logs'));
const RolePermissionPage = lazy(() => import('@/app/(admin)/(pages)/manajemen-role'));

// Auth & Other Pages from Template
const BasicLogin = lazy(() => import('@/app/(auth)/basic-login'));
const Error404 = lazy(() => import('@/app/(others)/404'));
const Maintenance = lazy(() => import('@/app/(others)/maintenance'));
const ComingSoon = lazy(() => import('@/app/(others)/coming-soon'));
const Offline = lazy(() => import('@/app/(others)/offline'));


export const layoutsRoutes = [
  {
    path: '/',
    name: 'Dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/rencana-aksi',
    name: 'Rencana Aksi',
    element: <RencanaAksiPage />,
  },
  {
    path: '/laporan/bulanan',
    name: 'Laporan Bulanan',
    element: <LaporanBulananPage />,
  },
  {
    path: '/laporan/matriks',
    name: 'Laporan Matriks',
    element: <LaporanMatriksPage />,
  },
  {
    path: '/laporan/tahunan',
    name: 'Laporan Tahunan',
    element: <LaporanTahunanPage />,
  },
  {
    path: '/master/kategori-utama',
    name: 'Kategori Utama',
    element: <KategoriUtamaPage />,
  },
  {
    path: '/master/kegiatan',
    name: 'Kegiatan',
    element: <KegiatanPage />,
  },
  {
    path: '/master/jabatan',
    name: 'Jabatan',
    element: <JabatanPage />,
  },
  {
    path: '/master/users',
    name: 'Users',
    element: <UserPage />,
  },
  {
    path: '/templates',
    name: 'Templates',
    element: <TemplateManagementPage />,
  },
  {
    path: '/audit-logs',
    name: 'Audit Logs',
    element: <AuditLogPage />,
  },
  {
    path: '/manajemen-role',
    name: 'Manajemen Role',
    element: <RolePermissionPage />,
  },
];

export const singlePageRoutes = [
  {
    path: '/basic-login',
    name: 'BasicLogin',
    element: <BasicLogin />,
  },
  {
    path: '/404',
    name: '404',
    element: <Error404 />,
  },
  {
    path: '/coming-soon',
    name: 'ComingSoon',
    element: <ComingSoon />,
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    element: <Maintenance />,
  },
  {
    path: '/offline',
    name: 'Offline',
    element: <Offline />,
  },
];
