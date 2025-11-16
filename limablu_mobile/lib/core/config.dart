import 'dart:io' show Platform;

class Config {
  static String get baseUrl {
    if (Platform.isAndroid) return "http://10.0.2.2:8010";
    // iOS simulator (and macOS/Chrome during dev)
    return "http://127.0.0.1:8010";
  }
}