import { 
  FaClipboardList,
  FaUsers,
  FaFileAlt,
  FaCog,
  FaTachometerAlt,
  FaFolderOpen,
  FaShieldAlt
} from 'react-icons/fa';

export const menuItemsData = [{
  key: 'Dashboard',
  label: 'Dashboard',
  icon: FaTachometerAlt,
  href: '/dashboard'
}, {
  key: 'Rencana Aksi',
  label: 'Rencana Aksi',
  icon: FaClipboardList,
  href: '/rencana-aksi'
}, {
  key: 'Master Data',
  label: 'Master Data',
  icon: FaFolderOpen,
  children: [{
    key: 'Kategori Utama',
    label: 'Kategori Utama',
    href: '/master/kategori-utama'
  }, {
    key: 'Kegiatan',
    label: 'Kegiatan',
    href: '/master/kegiatan'
  }, {
    key: 'Jabatan',
    label: 'Jabatan',
    href: '/master/jabatan'
  }, {
    key: 'Pengguna',
    label: 'Pengguna',
    href: '/master/users'
  }]
}, {
  key: 'Laporan',
  label: 'Laporan',
  icon: FaFileAlt,
  children: [{
    key: 'Laporan Bulanan',
    label: 'Laporan Bulanan',
    href: '/laporan/bulanan'
  }, {
    key: 'Laporan Matriks',
    label: 'Laporan Matriks',
    href: '/laporan/matriks'
  }, {
    key: 'Laporan Tahunan',
    label: 'Laporan Tahunan',
    href: '/laporan/tahunan'
  }]
}, {
  key: 'Administrasi',
  label: 'Administrasi',
  icon: FaCog,
  children: [{
    key: 'Template',
    label: 'Template',
    href: '/templates'
  }, {
    key: 'Role & Permission',
    label: 'Role & Permission',
    href: '/manajemen-role'
  }, {
    key: 'Audit Log',
    label: 'Audit Log',
    href: '/audit-logs'
  }]
}];