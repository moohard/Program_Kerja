import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart'; // Pastikan import ini ada
import '../services/api_service.dart';
import 'notification_history_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  LoginScreenState createState() => LoginScreenState();
}

class LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _apiService = ApiService();

  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String _userType = 'pihak';
  bool _isRegisterMode = false;
  bool _isLoading = false;
  String? _nikError;
  String? _passwordError;
  String? _confirmPasswordError;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _clearErrors() {
    setState(() {
      _nikError = null;
      _passwordError = null;
      _confirmPasswordError = null;
    });
  }

  void _submitForm() async {
    _clearErrors();
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      Map<String, dynamic> response;
      if (_isRegisterMode) {
        response = await _apiService.register(
          nik: _identifierController.text,
          password: _passwordController.text,
          passwordConfirmation: _confirmPasswordController.text,
        );
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              response['message'] ?? 'Registrasi berhasil. Silakan login.',
            ),
            backgroundColor: Colors.green,
          ),
        );
        setState(() {
          _isRegisterMode = false;
          _passwordController.clear();
          _confirmPasswordController.clear();
        });
      } else {
        response = await _apiService.login(
          identifier: _identifierController.text,
          userType: _userType,
          password: _userType == 'pihak' ? _passwordController.text : null,
        );

        if (response['success'] == true && response.containsKey('data')) {
          await _saveSessionAndNavigate(response['data']);
        } else {
          _handleLoginError(response);
        }
      }
    } catch (e) {
      _handleLoginError(
        e is Map<String, dynamic> ? e : {'message': e.toString()},
      );
    } finally {
      if(mounted) {
        setState(() {
            _isLoading = false;
        });
      }
    }
  }

  void _handleLoginError(Map<String, dynamic> errorData) {
    if (errorData['error_code'] == 'ACCOUNT_NOT_REGISTERED') {
      setState(() {
        _nikError = 'Akun belum terdaftar.';
      });
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Akun Belum Terdaftar'),
          content: Text(
            errorData['message'] ??
                'NIK Anda terdaftar di SIPP tapi belum memiliki akun di aplikasi ini. Apakah Anda ingin mendaftar sekarang?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Nanti Saja'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                setState(() {
                  _isRegisterMode = true;
                });
              },
              child: const Text('Daftar Sekarang'),
            ),
          ],
        ),
      );
    } else {
      final errors = errorData['errors'] as Map<String, dynamic>?;
      if (errors != null) {
        setState(() {
          _nikError = errors['nik']?[0];
          _passwordError = errors['password']?[0];
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              errorData['message'] ?? 'Terjadi kesalahan tidak terduga.',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // --- MODIFIKASI FUNGSI INI ---
  Future<void> _saveSessionAndNavigate(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', data['token']);
    await prefs.setInt('user_id', data['user']['id']);
    await prefs.setString('user_nama', data['user']['nama']);
    await prefs.setString('user_role', data['user']['role']);

    // Panggil fungsi untuk mendaftarkan token ke server
    // Baris ini adalah bagian paling PENTING
    await _registerDeviceToken();

    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => const NotificationHistoryScreen(),
        ),
      );
    }
  }

  // --- TAMBAHKAN FUNGSI BARU INI ---
  Future<void> _registerDeviceToken() async {
    try {
      // 1. Meminta izin notifikasi dari pengguna (wajib untuk iOS & Android 13+)
      await FirebaseMessaging.instance.requestPermission();
      
      // 2. Mendapatkan token FCM unik untuk perangkat ini
      final fcmToken = await FirebaseMessaging.instance.getToken();
      
      if (fcmToken != null) {
        // Log ini akan muncul di debug console Flutter Anda
        print('Firebase FCM Token: $fcmToken');
        
        // 3. Mengirim token ke backend Anda
        await ApiService.registerDeviceToken(fcmToken);
      } else {
        print('Gagal mendapatkan FCM token.');
      }
    } catch(e) {
        print('Error saat registrasi device token: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isPihak = _userType == 'pihak';

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.blue.shade800, Colors.blue.shade400],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Card(
              elevation: 8,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _isRegisterMode
                            ? 'Daftar Akun Pihak'
                            : 'Selamat Datang',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[800],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Silakan masuk untuk melanjutkan',
                        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 24),
                      if (!_isRegisterMode)
                        SegmentedButton<String>(
                          segments: const [
                            ButtonSegment(
                              value: 'pihak',
                              label: Text('Pihak'),
                              icon: Icon(Icons.person),
                            ),
                            ButtonSegment(
                              value: 'pegawai',
                              label: Text('Pegawai'),
                              icon: Icon(Icons.work),
                            ),
                          ],
                          selected: {_userType},
                          onSelectionChanged: (newSelection) {
                            setState(() {
                              _userType = newSelection.first;
                              _identifierController.clear();
                              _passwordController.clear();
                              _confirmPasswordController.clear();
                              _clearErrors();
                            });
                          },
                        ),
                      const SizedBox(height: 20),
                      TextFormField(
                        controller: _identifierController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: isPihak ? 'NIK' : 'Nomor HP',
                          prefixIcon: Icon(isPihak ? Icons.badge : Icons.phone),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          errorText: _nikError,
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Kolom ini tidak boleh kosong';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      if (isPihak)
                        TextFormField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: InputDecoration(
                            labelText: 'Password',
                            prefixIcon: const Icon(Icons.lock),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            errorText: _passwordError,
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Password tidak boleh kosong';
                            }
                            if (_isRegisterMode && value.length < 8) {
                              return 'Password minimal 8 karakter';
                            }
                            return null;
                          },
                        ),
                      if (isPihak) const SizedBox(height: 16),
                      if (isPihak && _isRegisterMode)
                        TextFormField(
                          controller: _confirmPasswordController,
                          obscureText: true,
                          decoration: InputDecoration(
                            labelText: 'Konfirmasi Password',
                            prefixIcon: const Icon(Icons.lock_outline),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            errorText: _confirmPasswordError,
                          ),
                          validator: (value) {
                            if (value != _passwordController.text) {
                              return 'Konfirmasi password tidak cocok';
                            }
                            return null;
                          },
                        ),
                      if (isPihak && _isRegisterMode)
                        const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _submitForm,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue[700],
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                  ),
                                )
                              : Text(_isRegisterMode ? 'DAFTAR AKUN' : 'MASUK'),
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (isPihak)
                        RichText(
                          text: TextSpan(
                            text: _isRegisterMode
                                ? 'Sudah punya akun? '
                                : 'Belum punya akun? ',
                            style: TextStyle(color: Colors.grey[600]),
                            children: [
                              TextSpan(
                                text: _isRegisterMode
                                    ? 'Login di sini'
                                    : 'Daftar di sini',
                                style: TextStyle(
                                  color: Colors.blue[700],
                                  fontWeight: FontWeight.bold,
                                  decoration: TextDecoration.underline,
                                ),
                                recognizer: TapGestureRecognizer()
                                  ..onTap = () {
                                    setState(() {
                                      _isRegisterMode = !_isRegisterMode;
                                      _clearErrors();
                                    });
                                  },
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

