// Minimal models & helpers to map API JSON

class ProviderInfo {
  final String provider;
  final double pricePerKwh;
  final double capacityKwh;
  ProviderInfo({required this.provider, required this.pricePerKwh, required this.capacityKwh});

  Map<String, dynamic> toJson() => {
    "provider": provider,
    "price_per_kwh": pricePerKwh,
    "capacity_kwh": capacityKwh,
  };

  static ProviderInfo fromJson(Map<String, dynamic> j) => ProviderInfo(
    provider: j['provider'],
    pricePerKwh: (j['price_per_kwh'] as num).toDouble(),
    capacityKwh: (j['capacity_kwh'] as num).toDouble(),
  );
}

class UserConfig {
  final String name;
  final String profile; // e.g., basic_lighting
  final double alpha;   // price priority 0..1
  UserConfig({required this.name, required this.profile, required this.alpha});

  Map<String, dynamic> toPrefEntry() => {name: alpha}; // for user_prefs map
  Map<String, dynamic> toJson() => {"name": name, "profile": profile};
}

class AllocationRow {
  final String user;
  final int day;
  final String provider;
  final double allocKwh;
  AllocationRow({required this.user, required this.day, required this.provider, required this.allocKwh});
  static AllocationRow fromJson(Map<String, dynamic> j) => AllocationRow(
    user: j['user'],
    day: j['day'],
    provider: j['provider'],
    allocKwh: (j['alloc_kwh'] as num).toDouble(),
  );
}

class BillRow {
  final int day;
  final double usedKwh;
  final double cost;
  final String status;
  BillRow({required this.day, required this.usedKwh, required this.cost, required this.status});
  static BillRow fromJson(Map<String, dynamic> j) => BillRow(
    day: j['day'],
    usedKwh: (j['used_kwh'] as num).toDouble(),
    cost: (j['cost'] as num).toDouble(),
    status: j['status'],
  );
}