// lib/ui/screens/usage_screen.dart
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/app_theme.dart';
import '../../data/api_client.dart';
import '../../data/models.dart';
import '../../data/repository.dart';
import '../widgets/glass_card.dart';
import '../widgets/stacked_bar.dart';
import '../../utils/csv.dart';

class UsageScreen extends StatefulWidget {
  final Repo repo;
  final ApiClient api;
  const UsageScreen({super.key, required this.repo, required this.api});

  @override
  State<UsageScreen> createState() => _UsageScreenState();
}

class _UsageScreenState extends State<UsageScreen> {
  Repo get repo => widget.repo;
  ApiClient get api => widget.api;

  final kwhFmt = NumberFormat("#,##0.00");

  // Filters
  int days = 30; // 7/30/90
  String view = "stacked"; // "stacked" | "totals"

  // Data
  List<ProviderInfo> providers = [];
  late List<UserConfig> users;
  List<Map<String, dynamic>> allocAll = [];
  List<AllocationRow> allocMine = [];
  bool loading = true;
  String? error;

  // Colors must match Home/Billing
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
    } catch (e) {
      error = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
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

  Map<String, double> _totalsByProvider(List<AllocationRow> rows) {
    final tot = <String, double>{};
    for (final r in rows) {
      tot[r.provider] = (tot[r.provider] ?? 0) + r.allocKwh;
    }
    return tot;
  }

  double _totalKwh(Map<String, double> m) =>
      m.values.fold(0.0, (s, v) => s + v);

  Future<void> _exportCsv() async {
    // Export day/provider matrix as CSV
    final stack = _stackData(allocMine);
    final csv = usageToCsv(stack, providers.map((e) => e.provider).toList());
    await saveCsv("usage_${days}d.csv", csv);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(kIsWeb ? "Downloaded CSV" : "Saved CSV")),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (error != null) {
      return Scaffold(appBar: AppBar(title: const Text("Usage")), body: Center(child: Text(error!)));
    }

    final me = users.first;
    final stack = _stackData(allocMine);
    final provNames = providers.map((e) => e.provider).toList();
    final totals = _totalsByProvider(allocMine);
    final overall = _totalKwh(totals);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text("Usage"),
        actions: [
          IconButton(
            tooltip: "Export CSV",
            icon: const Icon(Icons.download_outlined),
            onPressed: _exportCsv,
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
          padding: const EdgeInsets.fromLTRB(16, 100, 16, 24),
          children: [
            GlassCard(
              child: Wrap(
                runSpacing: 10, spacing: 12, crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text("Hello, ${me.name}", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                  const SizedBox(width: 12),
                  DropdownButton<int>(
                    value: days,
                    items: const [
                      DropdownMenuItem(value: 7, child: Text("Last 7 days")),
                      DropdownMenuItem(value: 30, child: Text("Last 30 days")),
                      DropdownMenuItem(value: 90, child: Text("Last 90 days")),
                    ],
                    onChanged: (v) { if (v != null) setState(() => days = v); _load(); },
                  ),
                  const SizedBox(width: 12),
                  SegmentedButton<String>(
                    segments: const [
                      ButtonSegment(value: "stacked", label: Text("Stacked")),
                      ButtonSegment(value: "totals", label: Text("Totals")),
                    ],
                    selected: {view},
                    onSelectionChanged: (s) => setState(() => view = s.first),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            if (view == "stacked") ...[
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Daily usage — kWh", style: TextStyle(fontWeight: FontWeight.w700)),
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
                        return Row(mainAxisSize: MainAxisSize.min, children: [
                          Container(width: 10, height: 10,
                            decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(3))),
                          const SizedBox(width: 6),
                          Text(p.provider, style: const TextStyle(color: AppTheme.textMuted)),
                        ]);
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ] else ...[
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Totals by provider — kWh", style: TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    ...providers.map((p) {
                      final kwh = (totals[p.provider] ?? 0.0);
                      final pct = overall > 0 ? (kwh / overall) : 0.0;
                      final barW = (pct * 1.0).clamp(0.0, 1.0);
                      final c = providerColors[p.provider]!;
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Container(
                                    height: 10,
                                    decoration: BoxDecoration(
                                      color: c.withOpacity(0.25),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Align(
                                      alignment: Alignment.centerLeft,
                                      child: FractionallySizedBox(
                                        widthFactor: barW,
                                        child: Container(
                                          decoration: BoxDecoration(
                                            color: c,
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                SizedBox(
                                  width: 80,
                                  child: Text("${(pct * 100).toStringAsFixed(0)}%",
                                      textAlign: TextAlign.right),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(p.provider, style: const TextStyle(color: AppTheme.textMuted)),
                                Text("${kwhFmt.format(kwh)} kWh"),
                              ],
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("Total"),
                        Text("${kwhFmt.format(overall)} kWh",
                            style: const TextStyle(fontWeight: FontWeight.w800)),
                      ],
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 18),

            // Daily breakdown (fixed: NO spreading ints)
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Daily breakdown", style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  ...((stack.keys.toList()..sort()).map((d) {
                    final m = stack[d]!;
                    final total = m.values.fold(0.0, (s, v) => s + v);
                    return ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: Text("Day $d"),
                      subtitle: Text(
                        providers
                            .where((p) => (m[p.provider] ?? 0) > 0)
                            .map((p) => "${p.provider}: ${kwhFmt.format(m[p.provider]!)} kWh")
                            .join("  •  "),
                      ),
                      trailing: Text("${kwhFmt.format(total)} kWh",
                          style: const TextStyle(fontWeight: FontWeight.w700)),
                    );
                  })),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}