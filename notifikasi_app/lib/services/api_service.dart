import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {

  // PERBAIKAN: Gunakan IP dan port yang benar
  static const String baseUrl = 'https://api.pa-penajam.go.id/api';
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

  // --- FUNGSI BARU UNTUK DITAMBAHKAN ---
  // Fungsi ini akan dipanggil setelah login berhasil.
  static Future<void> registerDeviceToken(String token) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/device-token'), // Panggil endpoint yang benar
            headers: await _getHeaders(),
            body: json.encode({'token': token}),
          )
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        print('Device token berhasil dikirim ke server.');
      } else {
        // Jika gagal, cukup cetak log. Jangan hentikan alur aplikasi.
        print(
          'Gagal mendaftarkan device token. Status: ${response.statusCode}',
        );
        print('Response Body: ${response.body}');
      }
    } catch (e) {
      print('Terjadi error saat mendaftarkan device token: $e');
    }
  }
  // --- AKHIR DARI FUNGSI BARU ---

  Future<Map<String, dynamic>> login({
    required String identifier,
    required String userType,
    String? password,
  }) async {
    final Map<String, dynamic> body = {
      'identifier': identifier,
      'user_type': userType,
    };
    if (password != null) {
      body['password'] = password;
    }

    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/login'),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: json.encode(body),
          )
          .timeout(const Duration(seconds: 30));
      return json.decode(response.body);
    } catch (e) {
      // Mengembalikan Map error jika koneksi gagal
      return {'success': false, 'message': 'Gagal terhubung ke server.'};
    }
  }

  // Fungsi Registrasi Pihak (DIPERBARUI)
  Future<Map<String, dynamic>> register({
    required String nik,
    required String password,
    required String passwordConfirmation, // <-- Parameter baru ditambahkan
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/pihak/register'),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: json.encode({
              'nik': nik,
              'password': password,
              'password_confirmation':
                  passwordConfirmation, // <-- Field baru ditambahkan
            }),
          )
          .timeout(const Duration(seconds: 30));

      return json.decode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Gagal terhubung ke server. $e'};
    }
  }

  // Fungsi untuk logout
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

  // Fungsi untuk mengambil riwayat notifikasi dengan error handling
  static Future<List<Map<String, dynamic>>> getNotificationHistory() async {
    try {
      final token = await _getToken();

      // Check jika token null atau empty
      if (token == null || token.isEmpty) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final response = await http
          .get(
            Uri.parse('$baseUrl/notification-history'),
            headers: await _getHeaders(),
          )
          .timeout(const Duration(seconds: 30));

      print('History Response Status: ${response.statusCode}');
      print('Response Body: ${response.body}'); // Debugging

      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        if (body['success'] == true) {
          return List<Map<String, dynamic>>.from(body['data']);
        } else {
          throw Exception(body['message'] ?? 'Gagal memuat data');
        }
      } else if (response.statusCode == 401) {
        // Clear token yang invalid
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('auth_token');

        throw Exception('Sesi habis, silakan login kembali.');
      } else {
        throw Exception('Gagal terhubung ke server: ${response.statusCode}');
      }
    } on TimeoutException {
      throw Exception('Request timeout - Server tidak merespons');
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  // Fungsi untuk mengambil detail notifikasi
  static Future<Map<String, dynamic>> getNotificationDetail(
    String type,
    int id,
  ) async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl/notification-detail/$type/$id'),
            headers: await _getHeaders(),
          )
          .timeout(const Duration(seconds: 30));

      print('Detail Response Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        if (body['success'] == true && body['data'] != null) {
          return body['data'] as Map<String, dynamic>;
        } else {
          throw Exception(body['message'] ?? 'Gagal memuat detail notifikasi');
        }
      } else if (response.statusCode == 401) {
        throw Exception('Sesi habis, silakan login kembali.');
      } else if (response.statusCode == 500) {
        throw Exception('Server sedang mengalami masalah (500)');
      } else {
        throw Exception('Gagal memuat detail: ${response.statusCode}');
      }
    } on TimeoutException {
      throw Exception('Request timeout - Server tidak merespons');
    } on http.ClientException catch (e) {
      throw Exception('Network error: ${e.message}');
    } on FormatException {
      throw Exception('Invalid response from server');
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  // Fungsi untuk test koneksi ke server
  static Future<bool> testConnection() async {
    try {
      final response = await http
          .get(Uri.parse(baseUrl))
          .timeout(const Duration(seconds: 10));

      return response.statusCode < 500;
    } on TimeoutException {
      return false;
    } on http.ClientException {
      return false;
    } catch (e) {
      return false;
    }
  }

  // Fungsi untuk test koneksi dasar (tanpa auth)
  static Future<bool> testBasicConnection() async {
    try {
      final response = await http
          .get(Uri.parse('http://192.168.9.11:8080'))
          .timeout(const Duration(seconds: 5));

      print('Basic connection test: ${response.statusCode}');
      return response.statusCode != 500;
    } on TimeoutException {
      print('Basic connection test: Timeout');
      return false;
    } on http.ClientException catch (e) {
      print('Basic connection test: ClientException - ${e.message}');
      return false;
    } catch (e) {
      print('Basic connection test: Unexpected error - $e');
      return false;
    }
  }
}
