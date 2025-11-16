import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/app_theme.dart';
import '../../data/api_client.dart';
import '../../data/repository.dart';
import '../../data/models.dart';
import '../widgets/glass_card.dart';
import '../widgets/stacked_bar.dart';

import '../../utils/csv.dart';

class BillingScreen extends StatefulWidget {
  final Repo repo;
  final ApiClient api;
  const BillingScreen({super.key, required this.repo, required this.api});

  @override
  State<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends State<BillingScreen> {
  Repo get repo => widget.repo;
  ApiClient get api => widget.api;

  final currency = NumberFormat.currency(symbol: "KSh ", decimalDigits: 0);

  // Controls
  int days = 30;
  String billingModel = "postpaid";
  double tokenKwh = 20;
  double allowanceKwh = 40;
  bool rollover = true;

  // Data
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
    setState(() { loading = true; error = null; });
    try {
      providers = repo.defaultProviders();
      users = [(await repo.fetchUsers()).first];

      // re-run optimize just for this page context
      final res = await repo.optimize(
        providers: providers,
        users: users,
        days: days,
      );

      allocAll = (res["allocation"] as List).cast<Map<String, dynamic>>();
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
        allowanceKwh: billingModel == "subscription" ? allowanceKwh : null,
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

  Map<int, Map<String,double>> _stackData(List<AllocationRow> rows) {
    final map = <int, Map<String,double>>{};
    for (final r in rows) {
      map.putIfAbsent(r.day, () => <String,double>{});
      map[r.day]![r.provider] = (map[r.day]![r.provider] ?? 0) + r.allocKwh;
    }
    return map;
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (error != null) {
      return Scaffold(appBar: AppBar(title: const Text("Billing")), body: Center(child: Text(error!)));
    }

    final me = users.first;
    final stack = _stackData(allocMine);
    final provNames = providers.map((e) => e.provider).toList();

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text("Billing"),
        actions: [
            IconButton(
                tooltip: "Export CSV",
                icon: const Icon(Icons.download_outlined),
                onPressed: () async {
                final csv = billToCsv(
                    bill.map((b) => {
                    "day": b.day,
                    "used_kwh": b.usedKwh,
                    "cost": b.cost,
                    "status": b.status,
                    }),
                    totalCost: totalCost,
                );
                await saveCsv("bill_${days}d.csv", csv);
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Bill exported")),
                );
                },
            ),
            Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Chip(
                label: Text(api.backendOnline ? "Online" : "Mock"),
                backgroundColor: api.backendOnline ? Colors.teal : Colors.orange,
                ),
            ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0B0D10), Color(0xFF0F1318)],
            begin: Alignment.topCenter, end: Alignment.bottomCenter,
          ),
        ),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 100, 16, 110),
          children: [
            // Controls
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Hello, ${me.name}", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 12, runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      DropdownButton<String>(
                        value: billingModel,
                        items: const [
                          DropdownMenuItem(value: "postpaid", child: Text("Postpaid")),
                          DropdownMenuItem(value: "token", child: Text("Prepaid (Tokens)")),
                          DropdownMenuItem(value: "subscription", child: Text("Subscription")),
                        ],
                        onChanged: (v) {
                          if (v == null) return;
                          setState(() => billingModel = v);
                          _bill();
                        },
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text("Days"),
                          const SizedBox(width: 8),
                          SizedBox(
                            width: 160,
                            child: Slider(
                              value: days.toDouble(),
                              min: 7, max: 60, divisions: 53,
                              label: "$days",
                              onChanged: (v) => setState(() => days = v.round()),
                              onChangeEnd: (_) => _load(),
                            ),
                          ),
                        ],
                      ),
                      if (billingModel == "token")
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text("Tokens (kWh)"),
                            const SizedBox(width: 8),
                            SizedBox(
                              width: 160,
                              child: Slider(
                                value: tokenKwh,
                                min: 5, max: 100, divisions: 19,
                                label: "${tokenKwh.toStringAsFixed(0)}",
                                onChanged: (v) => setState(() => tokenKwh = v),
                                onChangeEnd: (_) => _bill(),
                              ),
                            ),
                          ],
                        ),
                      if (billingModel == "subscription")
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text("Allowance (kWh)"),
                            const SizedBox(width: 8),
                            SizedBox(
                              width: 160,
                              child: Slider(
                                value: allowanceKwh,
                                min: 10, max: 200, divisions: 19,
                                label: "${allowanceKwh.toStringAsFixed(0)}",
                                onChanged: (v) => setState(() => allowanceKwh = v),
                                onChangeEnd: (_) => _bill(),
                              ),
                            ),
                            const SizedBox(width: 12),
                            const Text("Rollover"),
                            Switch(
                              value: rollover,
                              onChanged: (v) { setState(() => rollover = v); _bill(); },
                            ),
                          ],
                        ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Stacked usage (same as Home for context)
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Usage this period — kWh", style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 240,
                    child: StackedBar(data: stack, providers: provNames, colors: providerColors),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Bill details
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Bill details", style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  ...bill.map((b) => ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: Text("Day ${b.day} — ${b.status}"),
                        subtitle: Text("Used ${b.usedKwh.toStringAsFixed(2)} kWh"),
                        trailing: Text(currency.format(b.cost),
                            style: const TextStyle(fontWeight: FontWeight.w700)),
                      )),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Total"),
                      Text(currency.format(totalCost),
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}