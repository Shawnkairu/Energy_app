// lib/ui/screens/plan_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/app_theme.dart';
import '../widgets/glass_card.dart';
import '../../data/api_client.dart';
import '../../data/repository.dart';
import '../../data/models.dart';

class PlanScreen extends StatefulWidget {
  final Repo repo;
  final ApiClient api;
  const PlanScreen({super.key, required this.repo, required this.api});

  @override
  State<PlanScreen> createState() => _PlanScreenState();
}

class _PlanScreenState extends State<PlanScreen> {
  Repo get repo => widget.repo;
  ApiClient get api => widget.api;

  String model = "postpaid";    // "postpaid" | "token" | "subscription"
  double defaultTokens = 20;    // kWh hint for prepaid
  double allowance = 40;        // subscription allowance
  bool rollover = true;         // subscription rollover
  double alpha = 0.5;           // price vs capacity 0..1

  bool loading = true;
  String? error;

  late UserConfig me;
  List<UserConfig> users = [];
  List<ProviderInfo> providers = [];

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    setState(() { loading = true; error = null; });
    try {
      providers = repo.defaultProviders();
      users = await repo.fetchUsers();
      me = users.first;
      alpha = me.alpha;
    } catch (e) {
      error = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _save() async {
    HapticFeedback.lightImpact();
    setState(() => loading = true);
    try {
      if ((alpha - me.alpha).abs() > 1e-6) {
        await repo.patchUserAlpha(me.name, alpha);
      }
      if (!mounted) return;
      Navigator.pop(context, {
        "model": model,
        "token_kwh": defaultTokens,
        "allowance_kwh": allowance,
        "rollover": rollover,
        "alpha": alpha,
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to save: $e")),
      );
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Widget _modelTile({
    required String value,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final sel = model == value;
    return RadioListTile<String>(
      value: value,
      groupValue: model,
      onChanged: (v) => setState(() => model = v!),
      activeColor: AppTheme.accent,
      title: Row(
        children: [
          Icon(icon, color: sel ? AppTheme.accent : Colors.white),
          const SizedBox(width: 8),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
      subtitle: Text(subtitle, style: const TextStyle(color: AppTheme.textMuted)),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (error != null) {
      return Scaffold(appBar: AppBar(title: const Text("Plan")), body: Center(child: Text(error!)));
    }

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text("Plan"),
        actions: [
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
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text("Choose billing", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                const SizedBox(height: 6),
                _modelTile(
                  value: "postpaid",
                  title: "Postpaid",
                  subtitle: "Use power now, pay at month's end.",
                  icon: Icons.receipt_long_outlined,
                ),
                _modelTile(
                  value: "token",
                  title: "Prepaid (Tokens)",
                  subtitle: "Top up any amount and use until it runs out.",
                  icon: Icons.energy_savings_leaf_outlined,
                ),
                _modelTile(
                  value: "subscription",
                  title: "Subscription",
                  subtitle: "Fixed monthly allowance with optional rollover.",
                  icon: Icons.subscriptions_outlined,
                ),
              ]),
            ),
            const SizedBox(height: 16),

            if (model == "token") ...[
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Typical top‑up", style: TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    Slider(
                      value: defaultTokens,
                      min: 5, max: 100, divisions: 19,
                      label: "${defaultTokens.toStringAsFixed(0)} kWh",
                      onChanged: (v) => setState(() => defaultTokens = v),
                    ),
                    Text("Default: ${defaultTokens.toStringAsFixed(0)} kWh",
                        style: const TextStyle(color: AppTheme.textMuted)),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            if (model == "subscription") ...[
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Monthly allowance", style: TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    Slider(
                      value: allowance,
                      min: 10, max: 200, divisions: 19,
                      label: "${allowance.toStringAsFixed(0)} kWh",
                      onChanged: (v) => setState(() => allowance = v),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Text("Rollover"),
                        const SizedBox(width: 8),
                        Switch(
                          value: rollover,
                          onChanged: (v) => setState(() => rollover = v),
                        ),
                      ],
                    ),
                    Text("Unused allowance ${rollover ? "rolls over" : "expires"} next month",
                        style: const TextStyle(color: AppTheme.textMuted)),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Preference", style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text("Cheapest"),
                      Text("Capacity"),
                    ],
                  ),
                  Slider(
                    value: alpha,
                    min: 0, max: 1, divisions: 20,
                    label: "${(alpha * 100).round()}%",
                    onChanged: (v) => setState(() => alpha = v),
                  ),
                  Text("Balance between price and capacity: ${(alpha * 100).round()}%",
                      style: const TextStyle(color: AppTheme.textMuted)),
                ],
              ),
            ),
            const SizedBox(height: 22),

            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: loading ? null : _save,
                icon: loading
                    ? const SizedBox(
                        width: 16, height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                      )
                    : const Icon(Icons.check_circle_outline),
                label: const Text("Save"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}