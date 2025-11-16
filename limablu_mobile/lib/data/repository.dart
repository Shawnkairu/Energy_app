// lib/data/repository.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

import 'api_client.dart';
import 'models.dart';

class Repo {
  final ApiClient api;
  Repo(this.api);

  // Providers (static defaults for now; match your color map)
  List<ProviderInfo> defaultProviders() => [
        ProviderInfo(provider: "SolarOne", pricePerKwh: 0.12, capacityKwh: 500),
        ProviderInfo(provider: "GreenLight", pricePerKwh: 0.10, capacityKwh: 400),
        ProviderInfo(provider: "SunStream", pricePerKwh: 0.14, capacityKwh: 300),
        ProviderInfo(provider: "RayPower", pricePerKwh: 0.16, capacityKwh: 250),
        ProviderInfo(provider: "BrightSolar", pricePerKwh: 0.11, capacityKwh: 350),
        ProviderInfo(provider: "NovaEnergy", pricePerKwh: 0.13, capacityKwh: 280),
      ];

  // Users (backend if available, else fallback single user)
  Future<List<UserConfig>> fetchUsers() async {
    try {
      final list = await api.listUsers(); // GET /users -> List<Map>
      final users = list.map<UserConfig>((m) {
        final name = (m["name"] ?? "") as String;
        final profile = (m["profile"] ?? "basic_lighting") as String;
        final alphaNum = (m["alpha"] ?? m["price_priority"] ?? 0.5) as num;
        return UserConfig(name: name, profile: profile, alpha: alphaNum.toDouble());
      }).toList();
      return users;
    } catch (_) {
      return [UserConfig(name: "Amina", profile: "basic_lighting", alpha: 0.5)];
    }
  }

  // Optimize (delegate to ApiClient)
  Future<Map<String, dynamic>> optimize({
    required List<ProviderInfo> providers,
    required List<UserConfig> users,
    required int days,
  }) {
    return api.optimize(providers: providers, users: users, days: days);
  }

  // Bill (delegate to ApiClient)
  Future<Map<String, dynamic>> bill({
    required List<Map<String, dynamic>> alloc,
    required List<ProviderInfo> providers,
    required String model, // "postpaid"|"token"|"subscription"
    double? tokenKwh,
    double? allowanceKwh,
    bool rollover = true,
  }) {
    return api.bill(
      alloc: alloc,
      providers: providers,
      model: model,
      tokenKwh: tokenKwh,
      allowanceKwh: allowanceKwh,
      rollover: rollover,
    );
  }

  // Save user preference (price vs capacity)
  Future<Map<String, dynamic>> patchUserAlpha(String name, double alpha) async {
    try {
      return await api.patchUserAlpha(name, alpha);
    } catch (_) {
      // offline echo so UI updates
      return {"name": name, "price_priority": alpha, "offline": true};
    }
  }

  // Buy Power (used by BuyPowerScreen)
  Future<Map<String, dynamic>> buyPower(double amountKsh) {
    return api.buyPower(amountKsh: amountKsh);
  }
}