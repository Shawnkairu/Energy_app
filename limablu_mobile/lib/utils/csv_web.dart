// lib/utils/csv_web.dart
import 'dart:convert';
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

Future<void> saveCsv(String filename, String content) async {
  final bytes = utf8.encode(content);
  final blob = html.Blob([bytes], 'text/csv');
  final url = html.Url.createObjectUrlFromBlob(blob);
  final anchor = html.AnchorElement(href: url)
    ..setAttribute('download', filename)
    ..click();
  html.Url.revokeObjectUrl(url);
}