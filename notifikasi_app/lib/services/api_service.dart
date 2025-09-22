import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // [DIUBAH] - Arahkan ke URL backend Program Kerja Anda
  // Ganti '192.168.1.5' dengan IP address lokal komputer Anda
  static const String baseUrl = 'http://10.10.20.251:8000/api';

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  static Future<void> registerDeviceToken(String token) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/device-token'),
        headers: await _getHeaders(),
        body: json.encode({'token': token}),
      );
      if (response.statusCode == 200) {
        print('Device token berhasil dikirim ke server.');
      } else {
        print('Gagal mengirim device token. Status: ${response.statusCode}');
      }
    } catch (e) {
      print('Error saat mengirim device token: $e');
    }
  }

  // [DIUBAH] - Logika login disederhanakan
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/login'),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: json.encode({'email': email, 'password': password}),
          )
          .timeout(const Duration(seconds: 30));
      return json.decode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Gagal terhubung ke server.'};
    }
  }

  // [DIHAPUS] - Fungsi register tidak lagi diperlukan

  static Future<void> logout() async {
    try {
      final response = await http
          .post(Uri.parse('$baseUrl/logout'), headers: await _getHeaders())
          .timeout(const Duration(seconds: 10));

      print('Logout Response: ${response.statusCode}');
    } catch (e) {
      print("Error during logout: $e");
      // Abaikan error saat logout
    }
  }

  // [DIUBAH] - Endpoint untuk riwayat notifikasi baru
  static Future<List<Map<String, dynamic>>> getNotificationHistory() async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl/notifications/in-app'), // Endpoint baru
            headers: await _getHeaders(),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        // Strukturnya sedikit berbeda, kita langsung return list-nya
        return List<Map<String, dynamic>>.from(body);
      } else if (response.statusCode == 401) {
        throw Exception('Sesi habis, silakan login kembali.');
      } else {
        throw Exception('Gagal terhubung ke server: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  // [DIUBAH] - Endpoint untuk detail notifikasi baru (Rencana Aksi)
  static Future<Map<String, dynamic>> getNotificationDetail(
    String type,
    int id,
  ) async {
    // 'type' saat ini diabaikan, karena kita selalu mengambil detail Rencana Aksi
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl/rencana-aksi/$id'), // Endpoint baru
            headers: await _getHeaders(),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        return body['data'] as Map<String, dynamic>;
      } else {
        throw Exception('Gagal memuat detail: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error memuat detail: $e');
    }
  }
}
