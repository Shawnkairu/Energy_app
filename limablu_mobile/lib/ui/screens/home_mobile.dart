import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../data/repository.dart';
import '../../data/api_client.dart';
import '../../services/wallet.dart';
import '../../services/allowance.dart';
import '../widgets/glass_card.dart';

class HomeMobile extends StatefulWidget {
  final Repo repo;
  final ApiClient api;
  final WalletService wallet;
  final AllowanceService allowance;

  const HomeMobile({
    super.key,
    required this.repo,
    required this.api,
    required this.wallet,
    required this.allowance,
  });

  @override
  State<HomeMobile> createState() => _HomeMobileState();
}

class _HomeMobileState extends State<HomeMobile> {
  double _monthlyAllowance = 0;
  double _allowanceRemaining = 0;
  double _tokenBalance = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  Future<void> _load() async {
    await widget.allowance.ensureCurrentPeriod();
    setState(() {
      _monthlyAllowance = widget.allowance.state?.monthlyAllowanceKwh ?? 0;
      _allowanceRemaining = widget.allowance.state?.remainingKwh ?? 0;
      _tokenBalance = widget.wallet.balanceKwh; // <-- use balanceKwh
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // “At a glance” row
        Row(
          children: [
            Expanded(
              child: GlassCard(
                child: _metric(
                  label: "Allowance left",
                  value: "${_allowanceRemaining.toStringAsFixed(0)} kWh",
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: GlassCard(
                child: _metric(
                  label: "Token balance",
                  value: "${_tokenBalance.toStringAsFixed(2)} kWh",
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        GlassCard(
          child: _metric(
            label: "Monthly allowance",
            value: "${_monthlyAllowance.toStringAsFixed(0)} kWh",
          ),
        ),
        const SizedBox(height: 16),
        // Actions
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => Navigator.pushNamed(context, "/buy-power"),
                icon: const Icon(Icons.ev_station_rounded),
                label: const Text("Top up tokens"),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => Navigator.pushNamed(context, "/billing"),
                icon: const Icon(Icons.receipt_long_rounded),
                label: const Text("View bill"),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        // Coming next / tips
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _sectionTitle("Tips"),
              const SizedBox(height: 6),
              Text(
                "Track daily usage in the Usage tab. Set rollover & allowance in Settings.",
                style: const TextStyle(color: AppTheme.textMuted),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _metric({required String label, required String value}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppTheme.textMuted)),
        const SizedBox(height: 6),
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
      ],
    );
  }

  Widget _sectionTitle(String t) => Text(
        t,
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
      );
}