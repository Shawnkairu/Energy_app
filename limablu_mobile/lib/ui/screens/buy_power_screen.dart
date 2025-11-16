import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/app_theme.dart';
import '../widgets/glass_card.dart';
import '../../data/api_client.dart';
import '../../data/repository.dart';
import '../../services/wallet.dart';

class BuyPowerScreen extends StatefulWidget {
  final Repo repo;
  final ApiClient api;
  final WalletService wallet;
  const BuyPowerScreen({super.key, required this.repo, required this.api, required this.wallet});

  @override
  State<BuyPowerScreen> createState() => _BuyPowerScreenState();
}

class _BuyPowerScreenState extends State<BuyPowerScreen> {
  Repo get repo => widget.repo;
  ApiClient get api => widget.api;
  WalletService get wallet => widget.wallet;

  final _controller = TextEditingController();
  double _amount = 100; // default
  bool _loading = false;

  final _presets = const [50, 100, 250, 500, 1000];

  @override
  void initState() {
    super.initState();
    _controller.text = _amount.toStringAsFixed(0);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _setPreset(double v) {
    HapticFeedback.selectionClick();
    setState(() {
      _amount = v;
      _controller.text = v.toStringAsFixed(0);
    });
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (_amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Enter a valid amount")),
      );
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await repo.buyPower(_amount);
      HapticFeedback.lightImpact();

      // after getting the server response or mock result
      final kwh = res["tokens_kwh"] as double? ?? 0.0;
      final ref = res["reference"] as String? ?? "TOPUP-${DateTime.now().millisecondsSinceEpoch}";
      await wallet.addTopUp(kwh: kwh, amountKsh: _amount, reference: ref);

      if (!mounted) return;
      await showDialog(
        context: context,
        builder: (_) => AlertDialog(
          backgroundColor: AppTheme.card,
          title: const Text("Purchase successful"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Amount: KSh ${res['amount_ksh']}"),
              const SizedBox(height: 6),
              Text("Tokens: ${kwh.toStringAsFixed(2)} kWh"),
              const SizedBox(height: 6),
              Text("Ref: $ref"),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text("Close")),
          ],
        ),
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Payment failed: $e")),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text("Buy Power"),
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
                const Text("Top up", style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 10, runSpacing: 10,
                  children: _presets.map((p) {
                    final sel = _amount.round() == p;
                    return ChoiceChip(
                      selected: sel,
                      label: Text("KSh $p"),
                      onSelected: (_) => _setPreset(p.toDouble()),
                      selectedColor: AppTheme.accent.withOpacity(0.2),
                      labelStyle: TextStyle(
                        color: sel ? Colors.white : Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                      backgroundColor: const Color(0xFF0F1419),
                      shape: const StadiumBorder(side: BorderSide(color: Color(0xFF1E2935))),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _controller,
                  keyboardType: const TextInputType.numberWithOptions(decimal: false),
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: InputDecoration(
                    labelText: "Custom amount (KSh)",
                    filled: true,
                    fillColor: const Color(0xFF0F1419),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onChanged: (s) {
                    final v = double.tryParse(s) ?? 0;
                    setState(() => _amount = v);
                  },
                ),
                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _loading ? null : _submit,
                    icon: _loading
                        ? const SizedBox(
                            width: 16, height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                          )
                        : const Icon(Icons.flash_on),
                    label: const Text("Pay"),
                  ),
                ),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}