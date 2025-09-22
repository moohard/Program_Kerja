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
  State<NotificationHistoryScreen> createState() => _NotificationHistoryScreenState();
}

class _NotificationHistoryScreenState extends State<NotificationHistoryScreen> {
  Future<List<Map<String, dynamic>>>? _historyFuture;
  String _userName = 'Pengguna';

  @override
  void initState() {
    super.initState();
    initializeDateFormatting('id_ID', null);
    _loadInitialData();
    _setupFirebaseListeners();
  }

  void _setupFirebaseListeners() {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message.notification?.title ?? 'Notifikasi Baru'),
            action: SnackBarAction(label: 'Lihat', onPressed: () => _handleNotificationTap(message.data)),
          ),
        );
        _refreshHistory();
      }
    });

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleNotificationTap(message.data);
    });

    FirebaseMessaging.instance.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        Future.delayed(const Duration(milliseconds: 500), () => _handleNotificationTap(message.data));
      }
    });
  }

  void _handleNotificationTap(Map<String, dynamic> data) {
    final String? type = data['type'];
    final String? idString = data['id'];
    if (type != null && idString != null) {
      final int? id = int.tryParse(idString);
      if (id != null) {
        _navigateToDetail(type, id);
      }
    }
  }

  Future<void> _loadInitialData() async {
    final prefs = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        _userName = prefs.getString('user_name') ?? 'Pengguna';
        _historyFuture = _fetchHistory();
      });
    }
  }

  Future<List<Map<String, dynamic>>> _fetchHistory() async {
    try {
      return await ApiService.getNotificationHistory();
    } catch (e) {
      if (e.toString().contains('Sesi habis')) {
        _handleUnauthorizedAccess();
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
    await _logout();
  }

  Future<void> _logout() async {
    await ApiService.logout();
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
      MaterialPageRoute(builder: (context) => NotificationDetailScreen(type: type, id: id)),
    );
  }

  Future<void> _refreshHistory() async {
    if (mounted) {
      setState(() {
        _historyFuture = _fetchHistory();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifikasi Tugas'),
        backgroundColor: Colors.indigo.shade600,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _refreshHistory),
          IconButton(icon: const Icon(Icons.logout), onPressed: _logout),
        ],
      ),
      body: // ... (Struktur body bisa tetap sama, hanya `_buildNotificationCard` yang diubah)
          FutureBuilder<List<Map<String, dynamic>>>(
            future: _historyFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError) {
                return Center(child: Text('Error: ${snapshot.error}'));
              }
              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const Center(child: Text('Belum ada notifikasi.'));
              }
              final notifications = snapshot.data!;
              return ListView.builder(
                itemCount: notifications.length,
                itemBuilder: (context, index) {
                  final notif = notifications[index];
                  return _buildNotificationCard(notif);
                },
              );
            },
          ),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> notif) {
    // [DIUBAH] - Ekstrak data dari format notifikasi Laravel
    final data = notif['data'];
    final title = data['title'] ?? 'Notifikasi';
    final body = data['body'] ?? 'Tidak ada isi pesan.';
    final timestamp = notif['created_at'] ?? '';
    final rencanaAksiId = data['rencana_aksi_id'] ?? 0;
    final isRead = notif['read_at'] != null;

    String waktuFormatted = '';
    try {
      waktuFormatted = DateFormat('dd MMM yyyy • HH:mm', 'id_ID').format(DateTime.parse(timestamp));
    } catch (e) {/* ignore */}

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: isRead ? 1 : 4,
      color: isRead ? Colors.grey[200] : Colors.white,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.indigo[100],
          child: const Icon(Icons.assignment, color: Colors.indigo),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(body, maxLines: 2, overflow: TextOverflow.ellipsis),
        trailing: Text(waktuFormatted, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        onTap: () {
          if (rencanaAksiId > 0) {
            _navigateToDetail('rencana_aksi', rencanaAksiId);
          }
        },
      ),
    );
  }
}
