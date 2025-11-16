// lib/data/api_client.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/config.dart';
import 'models.dart';

class ApiClient {
  final String base = Config.baseUrl;

  // Backend reachability flag
  bool backendOnline = false;

  // Ping the backend once to set backendOnline flag
  Future<void> checkBackend() async {
    try {
      final res = await http
          .get(Uri.parse("$base/ping"))
          .timeout(const Duration(seconds: 3));
      backendOnline = (res.statusCode == 200);
      // ignore: avoid_print
      print(backendOnline ? "✅ Backend online" : "⚠️ Backend not OK");
    } catch (_) {
      backendOnline = false;
      // ignore: avoid_print
      print("❌ Backend offline, using mock where available");
    }
  }

  Future<Map<String, dynamic>> optimize({
    required List<ProviderInfo> providers,
    required List<UserConfig> users,
    required int days,
  }) async {
    final prefs = { for (final u in users) u.name : u.alpha };
    final body = {
      "providers": providers.map((p) => p.toJson()).toList(),
      "users": users.map((u) => u.toJson()).toList(),
      "days": days,
      "user_prefs": prefs,
    };
    final r = await http.post(
      Uri.parse("$base/optimize"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(body),
    );
    if (r.statusCode != 200) {
      throw Exception(r.body);
    }
    return jsonDecode(r.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> bill({
    required List<Map<String, dynamic>> alloc,
    required List<ProviderInfo> providers,
    required String model, // "postpaid"|"token"|"subscription"
    double? tokenKwh,
    double? allowanceKwh,
    bool rollover = true,
  }) async {
    final body = {
      "alloc": alloc,
      "providers": providers.map((p) => p.toJson()).toList(),
      "model": model,
      "token_kwh": tokenKwh,
      "allowance_kwh": allowanceKwh,
      "rollover": rollover,
    };
    final r = await http.post(
      Uri.parse("$base/bill"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(body),
    );
    if (r.statusCode != 200) {
      throw Exception(r.body);
    }
    return jsonDecode(r.body) as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> listUsers() async {
    final r = await http
        .get(Uri.parse("$base/users"))
        .timeout(const Duration(seconds: 10));
    if (r.statusCode != 200) {
      throw Exception("GET /users ${r.statusCode}: ${r.body}");
    }
    return (jsonDecode(r.body) as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> patchUserAlpha(String name, double alpha) async {
    final body = {"price_priority": alpha};
    final r = await http
        .patch(
          Uri.parse("$base/users/$name/prefs"),
          headers: {"Content-Type": "application/json"},
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 10));
    if (r.statusCode != 200) {
      throw Exception("PATCH /users $name ${r.statusCode}: ${r.body}");
    }
    return jsonDecode(r.body) as Map<String, dynamic>;
  }

  // Top-up tokens (prepaid). If backend not ready, we simulate success.
  Future<Map<String, dynamic>> buyPower({required double amountKsh}) async {
    final url = Uri.parse("$base/payments/buy_power");
    try {
      final r = await http
          .post(
            url,
            headers: {"Content-Type": "application/json"},
            body: jsonEncode({"amount_ksh": amountKsh}),
          )
          .timeout(const Duration(seconds: 10));

      if (r.statusCode == 200 || r.statusCode == 201) {
        return jsonDecode(r.body) as Map<String, dynamic>;
      } else {
        throw Exception("POST /payments/buy_power ${r.statusCode}: ${r.body}");
      }
    } catch (_) {
      // Fallback: simulate success so UI works now
      await Future.delayed(const Duration(milliseconds: 500));
      final double tokensKwh = (amountKsh / 50.0); // placeholder rate
      return {
        "status": "ok",
        "amount_ksh": amountKsh,
        "tokens_kwh": tokensKwh,
        "reference": "SIM-${DateTime.now().millisecondsSinceEpoch}"
      };
    }
  }
}