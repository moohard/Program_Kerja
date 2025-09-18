import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'login_screen.dart';
import 'notification_detail_screen.dart';
import '../services/api_service.dart';

class NotificationHistoryScreen extends StatefulWidget {
  const NotificationHistoryScreen({super.key});

  @override
  State<NotificationHistoryScreen> createState() =>
      _NotificationHistoryScreenState();
}

class _NotificationHistoryScreenState extends State<NotificationHistoryScreen> {
  Future<List<Map<String, dynamic>>>? _historyFuture;
  String _userName = 'Pengguna';
  String _userRole = 'pihak';
  bool _isConnected = true;

  @override
  void initState() {
    super.initState();
    initializeDateFormatting('id_ID', null);
    _checkConnection();
    _loadInitialData();
    _setupFirebaseListeners(); // Panggil listener
  }

  // --- PERBAIKAN UTAMA DIMULAI DI SINI ---

  void _setupFirebaseListeners() {
    // 1. Listener untuk notifikasi saat aplikasi di FOREGROUND (Sudah Ada)
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Menerima notifikasi saat aplikasi terbuka: ${message.notification?.title}');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message.notification?.title ?? 'Notifikasi Baru'),
            action: SnackBarAction(
              label: 'Lihat',
              onPressed: () => _handleNotificationTap(message.data),
            ),
          ),
        );
        _refreshHistory(); // Refresh daftar saat notifikasi masuk
      }
    });

    // 2. (BARU) Listener untuk saat notifikasi di-TAP saat aplikasi di BACKGROUND
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('Notifikasi di-tap dari background: ${message.notification?.title}');
      _handleNotificationTap(message.data);
    });

    // 3. (BARU) Cek jika aplikasi dibuka dari notifikasi saat TERMINATED (ditutup)
    // Ini dijalankan sekali saat aplikasi dimulai
    FirebaseMessaging.instance.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        print('Aplikasi dibuka dari notifikasi yang terminated: ${message.notification?.title}');
        // Beri jeda sedikit sebelum navigasi untuk memastikan UI siap
        Future.delayed(const Duration(milliseconds: 500), () {
            _handleNotificationTap(message.data);
        });
      }
    });
  }

  // (FUNGSI BARU) Untuk menangani logika navigasi dari notifikasi secara terpusat
  void _handleNotificationTap(Map<String, dynamic> data) {
    final String? type = data['type'];
    final String? idString = data['id'];

    print("Mencoba navigasi. Tipe: $type, ID: $idString");

    if (type != null && idString != null) {
      final int? id = int.tryParse(idString);
      if (id != null) {
        _navigateToDetail(type, id);
      } else {
        print("Gagal parse ID notifikasi: $idString");
      }
    } else {
       print("Data notifikasi tidak lengkap untuk navigasi.");
    }
  }

  // --- AKHIR PERBAIKAN UTAMA ---

  Future<void> _checkConnection() async {
    final isConnected = await ApiService.testConnection();
    if(mounted){
      setState(() {
        _isConnected = isConnected;
      });
      
      if (!isConnected) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 5),
          ),
        );
      }
    }
  }

  Future<void> _loadInitialData() async {
    final prefs = await SharedPreferences.getInstance();
    if(mounted){
      setState(() {
        _userName = prefs.getString('user_nama') ?? 'Pengguna';
        _userRole = prefs.getString('user_role') ?? 'pihak';
        _historyFuture = _fetchHistory();
      });
    }
  }

  Future<List<Map<String, dynamic>>> _fetchHistory() async {
    try {
      if (!_isConnected) {
        throw Exception('Tidak terhubung ke server');
      }
      return await ApiService.getNotificationHistory();
    } catch (e) {
      if (e.toString().contains('Sesi habis')) {
        _handleUnauthorizedAccess();
      } else if (e.toString().contains('Network error')) {
        if(mounted){
          setState(() {
            _isConnected = false;
          });
        }
      }
      rethrow;
    }
  }

  Future<void> _handleUnauthorizedAccess() async {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Sesi Anda telah habis. Silakan login kembali.'),
        backgroundColor: Colors.orange,
      ),
    );
    await _logout(isSessionExpired: true);
  }

  Future<void> _logout({bool isSessionExpired = false}) async {
    if (!isSessionExpired) {
      await ApiService.logout();
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (Route<dynamic> route) => false,
      );
    }
  }

  void _navigateToDetail(String type, int id) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => NotificationDetailScreen(type: type, id: id),
      ),
    );
  }

  Future<void> _refreshHistory() async {
    await _checkConnection();
    if(mounted){
      setState(() {
        _historyFuture = _fetchHistory();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Notifikasi'),
        backgroundColor: Colors.blue.shade700,
        foregroundColor: Colors.white,
        elevation: 4,
        shadowColor: Colors.black.withOpacity(0.3),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 24),
            tooltip: 'Refresh',
            onPressed: _refreshHistory,
          ),
          IconButton(
            icon: const Icon(Icons.logout, size: 24),
            tooltip: 'Logout',
            onPressed: () => _logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshHistory,
        color: Colors.blue.shade700,
        backgroundColor: Colors.white,
        child: Column(
          children: [
            if (!_isConnected)
              Container(
                padding: const EdgeInsets.all(12),
                color: Colors.red.shade600,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.wifi_off, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'Tidak terhubung ke server',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.blue.shade700,
                    Colors.blue.shade500,
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        _userRole == 'pihak' 
                            ? Icons.person_outline 
                            : Icons.badge_outlined,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Selamat Datang,',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _userName,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              height: 1.2,
                            ),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _userRole == 'pihak' ? 'Pihak Berperkara' : 'Pegawai',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            Expanded(
              child: FutureBuilder<List<Map<String, dynamic>>>(
                future: _historyFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return _buildLoadingState();
                  }
                  if (snapshot.hasError) {
                    return _buildErrorState(snapshot.error.toString());
                  }
                  if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return _buildEmptyState();
                  }

                  final notifications = snapshot.data!;
                  return ListView.builder(
                    itemCount: notifications.length,
                    padding: const EdgeInsets.only(bottom: 16),
                    itemBuilder: (context, index) {
                      final notif = notifications[index];
                      return _buildNotificationCard(notif);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
            strokeWidth: 2.5,
          ),
          const SizedBox(height: 16),
          Text(
            'Memuat notifikasi...',
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 16),
            Text(
              'Oops! Terjadi kesalahan',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error.replaceAll("Exception: ", ""),
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 14,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _refreshHistory,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue.shade700,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_off_outlined,
              size: 72,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'Belum ada notifikasi',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Notifikasi akan muncul di sini ketika ada update baru',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 14,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> notif) {
    final String jenis = notif['jenis']?.toString() ?? 'Tidak Diketahui';
    final String pesan = notif['pesan']?.toString() ?? 'Tidak ada isi pesan.';
    final String tanggalString = notif['tanggal'] ?? '';
    final int id = notif['id'] ?? 0;
    // PENTING: Sesuaikan 'type' dengan payload dari backend
    final String typeId = notif['type_id'] ?? '';

    String waktuFormatted = 'Waktu tidak valid';
    try {
      final dateTime = DateTime.parse(tanggalString);
      waktuFormatted = DateFormat('dd MMM yyyy • HH:mm', 'id_ID').format(dateTime);
    } catch (e) {
      //
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.1),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            if (id > 0 && typeId.isNotEmpty) {
              _navigateToDetail(typeId, id);
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Detail untuk notifikasi ini tidak tersedia.'),
                ),
              );
            }
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: _getColorForJenis(jenis).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _getIconForJenis(jenis),
                    color: _getColorForJenis(jenis),
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        pesan,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          height: 1.4,
                          color: Colors.black87,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        waktuFormatted,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getColorForJenis(jenis).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          jenis.replaceAll('_', ' ').toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: _getColorForJenis(jenis),
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                Icon(
                  Icons.chevron_right,
                  color: Colors.grey.shade400,
                  size: 24,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData _getIconForJenis(String jenis) {
    switch (jenis.toLowerCase()) {
      case 'sidang': return Icons.gavel_outlined;
      case 'pendaftaran': return Icons.app_registration_outlined;
      case 'akta_cerai': return Icons.description_outlined;
      case 'sisa_panjar': return Icons.account_balance_wallet_outlined;
      case 'putus': return Icons.flag_outlined;
      case 'putusan': return Icons.flag_outlined;
      default: return Icons.notifications_outlined;
    }
  }

  Color _getColorForJenis(String jenis) {
    switch (jenis.toLowerCase()) {
      case 'sidang': return Colors.orange.shade700;
      case 'pendaftaran': return Colors.blue.shade700;
      case 'akta_cerai': return Colors.green.shade700;
      case 'sisa_panjar': return Colors.purple.shade700;
      case 'putus': return Colors.red.shade700;
      case 'putusan': return Colors.red.shade700;
      default: return Colors.grey.shade700;
    }
  }
}
