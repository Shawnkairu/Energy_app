// lib/utils/csv_io.dart
import 'dart:convert';
import 'dart:io' as io;
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart' as pp;

Future<void> saveCsv(String filename, String content) async {
  final bytes = utf8.encode(content);
  final dir = await pp.getDownloadsDirectory() ?? await pp.getApplicationDocumentsDirectory();
  final file = io.File("${dir.path}/$filename");
  await file.writeAsBytes(bytes, flush: true);
  HapticFeedback.lightImpact();
}