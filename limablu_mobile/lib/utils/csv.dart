// lib/utils/csv.dart
export 'csv_shared.dart';

// Conditional import selects the right saver at compile-time
import 'csv_io.dart' if (dart.library.html) 'csv_web.dart' as platform;

// Public API
Future<void> saveCsv(String filename, String content) =>
    platform.saveCsv(filename, content);