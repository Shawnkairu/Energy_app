import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class WalletEntry {
  final DateTime ts;
  final String type; // "topup" | "deduct"
  final double kwh;
  final double amountKsh;
  final String? ref;

  WalletEntry({
    required this.ts,
    required this.type,
    required this.kwh,
    required this.amountKsh,
    this.ref,
  });

  Map<String, dynamic> toJson() => {
        "ts": ts.toIso8601String(),
        "type": type,
        "kwh": kwh,
        "amount_ksh": amountKsh,
        "ref": ref,
      };

  static WalletEntry fromJson(Map<String, dynamic> m) => WalletEntry(
        ts: DateTime.parse(m["ts"] as String),
        type: (m["type"] as String),
        kwh: (m["kwh"] as num).toDouble(),
        amountKsh: (m["amount_ksh"] as num).toDouble(),
        ref: (m["ref"] as String?),
      );
}

class WalletService {
  static const _storageKey = "wallet_ledger_v1";
  List<WalletEntry> _entries = [];

  List<WalletEntry> get entries => List.unmodifiable(_entries);

  double get balanceKwh =>
      _entries.fold(0.0, (s, e) => s + (e.type == "topup" ? e.kwh : -e.kwh));

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final s = prefs.getString(_storageKey);
    if (s == null) {
      _entries = [];
      return;
    }
    final list = (jsonDecode(s) as List).cast<Map<String, dynamic>>();
    _entries = list.map(WalletEntry.fromJson).toList()
      ..sort((a, b) => b.ts.compareTo(a.ts));
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    final s = jsonEncode(_entries.map((e) => e.toJson()).toList());
    await prefs.setString(_storageKey, s);
  }

  Future<void> addTopUp({
    required double kwh,
    required double amountKsh,
    required String reference,
  }) async {
    _entries.insert(
      0,
      WalletEntry(
        ts: DateTime.now(),
        type: "topup",
        kwh: kwh,
        amountKsh: amountKsh,
        ref: reference,
      ),
    );
    await _save();
  }

  Future<void> addDeduction({required double kwh, String? reason}) async {
    _entries.insert(
      0,
      WalletEntry(
        ts: DateTime.now(),
        type: "deduct",
        kwh: kwh,
        amountKsh: 0,
        ref: reason,
      ),
    );
    await _save();
  }

  Future<void> clearAll() async {
    _entries.clear();
    await _save();
  }
}