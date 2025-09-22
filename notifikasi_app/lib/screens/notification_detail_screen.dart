import 'package:flutter/material.dart';
import '../services/api_service.dart';

class NotificationDetailScreen extends StatefulWidget {
  final String type;
  final int id;

  const NotificationDetailScreen({super.key, required this.type, required this.id});

  @override
  State<NotificationDetailScreen> createState() => _NotificationDetailScreenState();
}

class _NotificationDetailScreenState extends State<NotificationDetailScreen> {
  Future<Map<String, dynamic>>? _detailFuture;

  @override
  void initState() {
    super.initState();
    _detailFuture = ApiService.getNotificationDetail(widget.type, widget.id);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detail Tugas')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _detailFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData) {
            return const Center(child: Text('Data tidak ditemukan.'));
          }

          final data = snapshot.data!;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildDetailRow('Deskripsi Tugas:', data['deskripsi_aksi'] ?? '-'),
                    _buildDetailRow('Status:', data['status'] ?? '-'),
                    _buildDetailRow('Prioritas:', data['priority'] ?? '-'),
                    _buildDetailRow('Penanggung Jawab:', data['assigned_to']?['name'] ?? '-'),
                    _buildDetailRow('Target Tanggal:', data['target_tanggal'] ?? '-'),
                    _buildDetailRow('Output/Catatan:', data['catatan'] ?? '-'),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey[600])),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 16)),
        ],
      ),
    );
  }
}