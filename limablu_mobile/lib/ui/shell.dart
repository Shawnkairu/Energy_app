import 'package:flutter/material.dart';
import '../core/app_theme.dart';
import '../data/repository.dart';
import '../data/api_client.dart';
import '../services/wallet.dart';
import '../services/allowance.dart';
import '../services/prefs.dart';

import 'screens/home_mobile.dart';
import 'screens/usage_mobile.dart';
import 'screens/wallet_mobile.dart';
import 'screens/settings_screen.dart';

class MobileShell extends StatefulWidget {
  final Repo repo;
  final ApiClient api;
  final WalletService wallet;
  final AllowanceService allowance;
  final AppPrefs prefs;

  const MobileShell({
    super.key,
    required this.repo,
    required this.api,
    required this.wallet,
    required this.allowance,
    required this.prefs,
  });

  @override
  State<MobileShell> createState() => _MobileShellState();
}

class _MobileShellState extends State<MobileShell> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomeMobile(repo: widget.repo, api: widget.api, wallet: widget.wallet, allowance: widget.allowance),
      UsageMobile(repo: widget.repo, api: widget.api),
      WalletMobile(repo: widget.repo, api: widget.api, wallet: widget.wallet),
      SettingsScreen(prefs: widget.prefs, allowance: widget.allowance),
    ];

    final titles = ["Home", "Usage", "Wallet", "Settings"];

    return Scaffold(
      appBar: AppBar(
        title: Text(titles[index]),
        backgroundColor: AppTheme.surface,
        foregroundColor: AppTheme.text,
      ),
      body: SafeArea(child: pages[index]),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: index,
        onTap: (i) => setState(() => index = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: "Home"),
          BottomNavigationBarItem(icon: Icon(Icons.show_chart_rounded), label: "Usage"),
          BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet_rounded), label: "Wallet"),
          BottomNavigationBarItem(icon: Icon(Icons.settings_rounded), label: "Settings"),
        ],
      ),
    );
  }
}