import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/app_theme.dart';
import '../../data/api_client.dart';
import '../../data/repository.dart';
import '../../services/wallet.dart';
import '../widgets/glass_card.dart';

class WalletScreen extends StatefulWidget {
  final Repo repo;
  final ApiClient api;
  final WalletService wallet;
  const WalletScreen({super.key, required this.repo, required this.api, required this.wallet});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  Repo get repo => widget.repo;
  ApiClient get api => widget.api;
  WalletService get wallet => widget.wallet;

  final kwhFmt = NumberFormat("#,##0.00");
  final money = NumberFormat.currency(symbol: "KSh ", decimalDigits: 0);
  final _presets = const [50, 100, 250, 500, 1000];

  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => loading = true);
    await wallet.load();
    if (mounted) setState(() => loading = false);
  }

  Future<void> _buy(double amountKsh) async {
    setState(() => loading = true);
    try {
      final res = await repo.buyPower(amountKsh);
      final kwh = (res["tokens_kwh"] as num?)?.toDouble() ?? 0.0;
      final ref = (res["reference"] as String?) ?? "N/A";
      await wallet.addTopUp(kwh: kwh, amountKsh: amountKsh, reference: ref);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Added ${kwhFmt.format(kwh)} kWh • ${money.format(amountKsh)}")),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Top‑up failed: $e")),
      );
    } finally {
      await wallet.load();
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bal = wallet.balanceKwh;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text("Wallet"),
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Token balance", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 6),
                  Text("${kwhFmt.format(bal)} kWh",
                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 14),
                  const Text("Quick top‑up", style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 10, runSpacing: 10,
                    children: _presets.map((p) {
                      return ChoiceChip(
                        label: Text("KSh $p"),
                        selected: false,
                        onSelected: (_) => _buy(p.toDouble()),
                        backgroundColor: const Color(0xFF0F1419),
                        shape: const StadiumBorder(side: BorderSide(color: Color(0xFF1E2935))),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("History", style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  if (loading)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 24.0),
                        child: CircularProgressIndicator(),
                      ),
                    ),
                  if (!loading && wallet.entries.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12.0),
                      child: Text("No transactions yet", style: TextStyle(color: AppTheme.textMuted)),
                    ),
                  if (!loading)
                    ...wallet.entries.map((e) {
                      final isTop = e.type == "topup";
                      return ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          radius: 14,
                          backgroundColor: isTop ? Colors.teal : Colors.redAccent,
                          child: Icon(isTop ? Icons.add : Icons.remove, size: 16, color: Colors.black),
                        ),
                        title: Text(isTop
                            ? "Top‑up ${kwhFmt.format(e.kwh)} kWh"
                            : "Deduct ${kwhFmt.format(e.kwh)} kWh"),
                        subtitle: Text(
                          "${e.ts.toLocal()} • ${isTop ? money.format(e.amountKsh) : (e.ref ?? '')}${isTop && e.ref != null ? " • ${e.ref}" : ""}",
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: AppTheme.textMuted),
                        ),
                        trailing: Text(isTop ? "+${kwhFmt.format(e.kwh)}" : "-${kwhFmt.format(e.kwh)}"),
                      );
                    }),
                  const SizedBox(height: 6),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () async {
                        final ok = await showDialog<bool>(
                          context: context,
                          builder: (_) => AlertDialog(
                            backgroundColor: AppTheme.card,
                            title: const Text("Clear history?"),
                            content: const Text("This removes all top-ups and deductions from this device."),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(context, false), child: const Text("Cancel")),
                              FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text("Clear")),
                            ],
                          ),
                        );
                        if (ok == true) {
                          await wallet.clearAll();
                          if (mounted) setState(() {});
                        }
                      },
                      child: const Text("Clear history"),
                    ),
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