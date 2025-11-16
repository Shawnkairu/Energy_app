import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/api_client.dart';
import '../../data/repository.dart';
import '../../data/models.dart';
import '../widgets/stacked_bar.dart';
import '../widgets/legend.dart';

class UserDashboard extends StatefulWidget {
  final UserConfig user;
  const UserDashboard({super.key, required this.user});

  @override
  State<UserDashboard> createState() => _UserDashboardState();
}

class _UserDashboardState extends State<UserDashboard> {
  final api = ApiClient();
  late final Repo repo = Repo(api);
  final currency = NumberFormat.currency(symbol: "", decimalDigits: 2);

  int days = 30;
  String billingModel = "postpaid";
  double tokenKwh = 10;
  double allowanceKwh = 20;
  bool rollover = true;

  List<ProviderInfo> providers = [];
  List<UserConfig> users = [];
  List<Map<String, dynamic>> allocAll = [];
  List<AllocationRow> allocUser = [];
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
      users = await repo.fetchUsers(); // use persisted/fallback users
      final res = await api.optimize(
        providers: providers,
        users: users,
        days: days,
      );

      allocAll = (res["allocation"] as List).cast<Map<String, dynamic>>();
      allocUser = allocAll
          .where((r) => r["user"] == widget.user.name)
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
      final res = await api.bill(
        alloc: allocAll.where((r) => r["user"] == widget.user.name).toList(),
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
      return Scaffold(
        appBar: AppBar(title: Text("Dashboard — ${widget.user.name}")),
        body: Center(child: Text("Failed to load data:\n$error")),
      );
    }

    final provNames = providers.map((e) => e.provider).toList();
    final stackData = _stackData(allocUser);

    return Scaffold(
      appBar: AppBar(title: Text("Dashboard — ${widget.user.name}")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Controls
          Wrap(spacing: 12, runSpacing: 12, children: [
            Row(mainAxisSize: MainAxisSize.min, children: [
              const Text("Days:"), const SizedBox(width: 8),
              DropdownButton<int>(
                value: days,
                items: const [7,14,30].map((d)=>DropdownMenuItem(value:d, child:Text("$d"))).toList(),
                onChanged: (v){ if(v!=null){ days=v; _load(); } },
              ),
            ]),
            Row(mainAxisSize: MainAxisSize.min, children: [
              const Text("Billing: "), const SizedBox(width: 8),
              DropdownButton<String>(
                value: billingModel,
                items: const [
                  DropdownMenuItem(value:"postpaid", child:Text("Postpaid")),
                  DropdownMenuItem(value:"token", child:Text("Token (Prepaid)")),
                  DropdownMenuItem(value:"subscription", child:Text("Subscription")),
                ],
                onChanged: (v){ if(v!=null){ billingModel=v; _bill(); } },
              ),
            ]),
            if (billingModel == "token")
              Row(mainAxisSize: MainAxisSize.min, children: [
                const Text("Tokens (kWh): "), const SizedBox(width: 8),
                DropdownButton<double>(
                  value: tokenKwh,
                  items: const [5,10,20,50].map((d)=>DropdownMenuItem(value:d.toDouble(), child:Text("$d"))).toList(),
                  onChanged: (v){ if(v!=null){ tokenKwh=v; _bill(); } },
                ),
              ]),
            if (billingModel == "subscription")
              Row(mainAxisSize: MainAxisSize.min, children: [
                const Text("Allowance (kWh): "), const SizedBox(width: 8),
                DropdownButton<double>(
                  value: allowanceKwh,
                  items: const [10,20,40,60].map((d)=>DropdownMenuItem(value:d.toDouble(), child:Text("$d"))).toList(),
                  onChanged: (v){ if(v!=null){ allowanceKwh=v; _bill(); } },
                ),
                const SizedBox(width: 12),
                Row(children: [
                  const Text("Rollover"),
                  Switch(value: rollover, onChanged:(v){ rollover=v; _bill(); }),
                ]),
              ]),
          ]),

          const SizedBox(height: 16),

          // Chart
          Card(
            elevation: 2, child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text("Daily Allocation (kWh) — stacked by provider",
                    style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                ProviderLegend(colorMap: providerColors),
                const SizedBox(height: 10),
                SizedBox(height: 260,
                  child: StackedBar(
                    data: stackData,
                    providers: provNames,
                    colors: providerColors,   // matches StackedBar signature
                  )),
              ]),
            ),
          ),

          const SizedBox(height: 16),

          // Billing
          Card(
            elevation: 2, child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text("Billing", style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text("Total cost: ${currency.format(totalCost)}"),
                const SizedBox(height: 8),
                SizedBox(
                  height: 240,
                  child: ListView.builder(
                    itemCount: bill.length,
                    itemBuilder: (_, i) {
                      final b = bill[i];
                      return ListTile(
                        dense: true,
                        title: Text("Day ${b.day}"),
                        subtitle: Text("Used ${b.usedKwh.toStringAsFixed(3)} kWh • ${b.status}"),
                        trailing: Text(currency.format(b.cost)),
                      );
                    },
                  ),
                ),
              ]),
            ),
          ),
        ]),
      ),
    );
  }
}