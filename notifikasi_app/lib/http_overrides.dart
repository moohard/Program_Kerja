import 'dart:io';

// KELAS INI HANYA UNTUK PENGEMBANGAN LOKAL
// JANGAN GUNAKAN DI VERSI PRODUKSI
class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
  }
}
