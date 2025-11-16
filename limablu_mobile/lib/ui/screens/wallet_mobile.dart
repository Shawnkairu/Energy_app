import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../data/repository.dart';
import '../../data/api_client.dart';
import '../../services/wallet.dart';
import '../widgets/glass_card.dart';

class WalletMobile extends StatelessWidget {
  final Repo repo;
  final ApiClient api;
  final WalletService wallet;

  const WalletMobile({
    super.key,
    required this.repo,
    required this.api,
    required this.wallet,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Token balance", style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Text("${wallet.balanceKwh.toStringAsFixed(2)} kWh",
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.pushNamed(context, "/buy-power"),
                      icon: const Icon(Icons.add_circle_outline_rounded),
                      label: const Text("Top up"),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => Navigator.pushNamed(context, "/wallet-full"),
                      icon: const Icon(Icons.history_rounded),
                      label: const Text("View history"),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text("Subscription", style: TextStyle(fontWeight: FontWeight.w700)),
              SizedBox(height: 8),
              Text("Manage allowance & rollover in Settings.", style: TextStyle(color: AppTheme.textMuted)),
            ],
          ),
        ),
      ],
    );
  }
}