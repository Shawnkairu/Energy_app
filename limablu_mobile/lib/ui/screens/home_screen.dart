// lib/ui/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/app_theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/bottom_panel.dart';
import '../widgets/stacked_bar.dart';

import '../../data/api_client.dart';
import '../../data/repository.dart';
import '../../data/models.dart';

// Tiny status chip in the AppBar
Widget backendStatusChip(ApiClient api) {
  return Chip(
    label: Text(api.backendOnline ? "Online" : "Mock"),
    backgroundColor: api.backendOnline ? Colors.teal : Colors.orange,
  );
}

class HomeScreen extends StatefulWidget {
  final Repo repo;
  final ApiClient api;
  const HomeScreen({super.key, required this.repo, required this.api});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Repo get repo => widget.repo;
  ApiClient get api => widget.api;

  final currency = NumberFormat.currency(symbol: "KSh ", decimalDigits: 0);

  int days = 30;
  String billingModel = "postpaid";
  double tokenKwh = 20;
  double allowanceKwh = 40;
  bool rollover = true;

  List<ProviderInfo> providers = [];
  late List<UserConfig> users;
  List<Map<String, dynamic>> allocAll = [];
  List<AllocationRow> allocMine = [];
  List<BillRow> bill = [];
  double totalCost = 0;
  bool loading = true;
  String? error;

  final Map<String, Color> providerColors = const {
    "SolarOne": Color(0xFF64B5F6),
    "GreenLight": Color(0xFF81C784),
    "SunStream": Color(0xFFE57373),
    "RayPower": Color(0xFFFFB74D),
    "BrightSolar": Color(0xFFBA68C8),
    "NovaEnergy": Color(0xFF4DB6AC),
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      providers = repo.defaultProviders();
      users = [(await repo.fetchUsers()).first];

      final res = await repo.optimize(
        providers: providers,
        users: users,
        days: days,
      );

      allocAll =
          (res["allocation"] as List).cast<Map<String, dynamic>>();
      allocMine = allocAll
          .where((r) => r["user"] == users.first.name)
          .map((e) => AllocationRow.fromJson(e as Map<String, dynamic>))
          .toList();

      await _bill();
    } catch (e) {
      error = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _bill() async {
    try {
      final res = await repo.bill(
        alloc: allocAll.where((r) => r["user"] == users.first.name).toList(),
        providers: providers,
        model: billingModel,
        tokenKwh: billingModel == "token" ? tokenKwh : null,
        allowanceKwh:
            billingModel == "subscription" ? allowanceKwh : null,
        rollover: rollover,
      );

      bill = (res["bill"] as List)
          .map((e) => BillRow.fromJson(e as Map<String, dynamic>))
          .toList();
      totalCost = (res["total_cost"] as num).toDouble();
      setState(() {});
    } catch (e) {
      error = e.toString();
    }
  }

  Map<int, Map<String, double>> _stackData(List<AllocationRow> rows) {
    final map = <int, Map<String, double>>{};
    for (final r in rows) {
      map.putIfAbsent(r.day, () => <String, double>{});
      map[r.day]![r.provider] =
          (map[r.day]![r.provider] ?? 0) + r.allocKwh;
    }
    return map;
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    if (error != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text("LimaBlu"),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: backendStatusChip(api),
            ),
          ],
        ),
        body: Center(child: Text("Failed to load data:\n$error")),
      );
    }

    final me = users.first;
    final stack = _stackData(allocMine);
    final provNames = providers.map((e) => e.provider).toList();

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text("Hi, ${me.name}",
            style: const TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: backendStatusChip(api),
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0B0D10), Color(0xFF0F1318)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 100, 16, 110),
          children: [
            // Status / CTAs
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Home",
                      style: TextStyle(
                          fontSize: 22, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      Chip(
                        label: Text(api.backendOnline ? "Online" : "Mock"),
                        backgroundColor:
                            api.backendOnline ? Colors.teal : Colors.orange,
                      ),
                      StatChip(
                        label: "Plan",
                        value: billingModel[0].toUpperCase() +
                            billingModel.substring(1),
                      ),
                      StatChip(
                        label: "Est. bill",
                        value: currency.format(totalCost),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: FilledButton(
                          onPressed: () =>
                              Navigator.pushNamed(context, "/buy-power"),
                          child: const Text("Buy power"),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () async {
                            final res =
                                await Navigator.pushNamed(context, "/plan");
                            if (res is Map) {
                              setState(() {
                                billingModel =
                                    (res["model"] as String?) ?? billingModel;
                                tokenKwh =
                                    (res["token_kwh"] as num?)
                                            ?.toDouble() ??
                                        tokenKwh;
                                allowanceKwh =
                                    (res["allowance_kwh"] as num?)
                                            ?.toDouble() ??
                                        allowanceKwh;
                                rollover =
                                    (res["rollover"] as bool?) ?? rollover;
                              });
                              await _bill();
                            }
                          },
                          child: const Text("Change plan"),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton(
                            onPressed: () => Navigator.pushNamed(context, "/wallet"),
                            child: const Text("Wallet"),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Usage chart
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("This month — kWh",
                      style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 260,
                    child: StackedBar(
                      data: stack,
                      providers: provNames,
                      colors: providerColors,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 12,
                    children: providers.map((p) {
                      final c = providerColors[p.provider]!;
                      return Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: c,
                              borderRadius: BorderRadius.circular(3),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            p.provider,
                            style: const TextStyle(
                                color: AppTheme.textMuted),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Recent charges
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Recent charges",
                      style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  ...bill.take(8).map((b) => ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: Text("Day ${b.day} — ${b.status}"),
                        trailing: Text(
                          currency.format(b.cost),
                          style: const TextStyle(
                              fontWeight: FontWeight.w700),
                        ),
                        subtitle: Text(
                            "Used ${b.usedKwh.toStringAsFixed(2)} kWh"),
                      )),
                  const SizedBox(height: 6),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () =>
                          Navigator.pushNamed(context, "/billing"),
                      child: const Text("View all"),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),

      // Sticky control bar
      bottomNavigationBar: BottomControlPanel(
        days: days,
        onDaysChanged: (v) {
          setState(() => days = v);
          _load();
        },
        billingModel: billingModel,
        onBillingChanged: (m) {
          setState(() => billingModel = m);
          _bill();
        },
        tokenKwh: tokenKwh,
        onTokenChanged: billingModel == "token"
            ? (v) {
                setState(() => tokenKwh = v);
                _bill();
              }
            : null,
        allowanceKwh: allowanceKwh,
        onAllowanceChanged: billingModel == "subscription"
            ? (v) {
                setState(() => allowanceKwh = v);
                _bill();
              }
            : null,
        rollover: rollover,
        onRolloverChanged: billingModel == "subscription"
            ? (v) {
                setState(() => rollover = v);
                _bill();
              }
            : null,
      ),
    );
  }
}