import 'package:flutter/material.dart';

import 'core/app_theme.dart';
import 'data/api_client.dart';
import 'data/repository.dart';
import 'services/wallet.dart';
import 'services/allowance.dart';
import 'services/prefs.dart';

import 'ui/shell.dart';
import 'ui/screens/billing_screen.dart';
import 'ui/screens/buy_power_screen.dart';
import 'ui/screens/wallet_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final api = ApiClient();
  await api.checkBackend();

  final repo = Repo(api);

  final wallet = WalletService();
  await wallet.load();

  final allowance = AllowanceService();
  await allowance.load();

  final prefs = AppPrefs();
  // await prefs.load(); // <-- important
  await prefs.init();

  runApp(LimaBluApp(
    repo: repo,
    api: api,
    wallet: wallet,
    allowance: allowance,
    prefs: prefs,
  ));
}

class LimaBluApp extends StatelessWidget {
  final Repo repo;
  final ApiClient api;
  final WalletService wallet;
  final AllowanceService allowance;
  final AppPrefs prefs;

  const LimaBluApp({
    super.key,
    required this.repo,
    required this.api,
    required this.wallet,
    required this.allowance,
    required this.prefs,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "LimaBlu",
      theme: AppTheme.light(),
      // darkTheme: AppTheme.dark(),
      // themeMode: ThemeMode.dark, // or ThemeMode.system
      home: MobileShell(
        repo: repo,
        api: api,
        wallet: wallet,
        allowance: allowance,
        prefs: prefs,
      ),
      routes: {
        "/buy-power": (_) => BuyPowerScreen(repo: repo, api: api, wallet: wallet),
        "/wallet-full": (_) => WalletScreen(repo: repo, api: api, wallet: wallet),
        "/billing": (_) => BillingScreen(
          repo: repo,
          api: api,
        ),
      },
    );
  }
}