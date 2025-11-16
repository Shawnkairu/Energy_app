import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../services/prefs.dart';
import '../../services/allowance.dart';
import '../widgets/glass_card.dart';

class SettingsScreen extends StatefulWidget {
  final AppPrefs prefs;
  final AllowanceService allowance;

  const SettingsScreen({super.key, required this.prefs, required this.allowance});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _ctrl = TextEditingController();
  bool _rollover = true;
  String _order = "allowance → tokens → postpaid";

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    await widget.allowance.ensureCurrentPeriod();
    _ctrl.text = (widget.allowance.state?.monthlyAllowanceKwh ?? 100).toStringAsFixed(0);
    _rollover = widget.allowance.state?.rollover ?? true;
    final o = await widget.prefs.getDeductionOrder();
    _order = o.join(" → ");
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Monthly Allowance (kWh)", style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              TextField(
                controller: _ctrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(hintText: "e.g. 100"),
              ),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Rollover unused kWh"),
                  Switch(
                    value: _rollover,
                    onChanged: (v) => setState(() => _rollover = v),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        GlassCard(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Deduction order", style: TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Text(_order, style: const TextStyle(color: AppTheme.textMuted)),
                  ],
                ),
              ),
              TextButton(
                onPressed: () async {
                  final next = await widget.prefs.rotateDeductionOrder();
                  setState(() => _order = next.join(" → "));
                },
                child: const Text("Rotate"),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: () async {
            final v = double.tryParse(_ctrl.text.trim());
            if (v == null) return;
            await widget.allowance.setPlan(
              monthlyAllowanceKwh: v,
              rollover: _rollover,
              newPlan: true,
            );
            if (!mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text("Saved"), behavior: SnackBarBehavior.floating),
            );
          },
          child: const Text("Save"),
        ),
      ],
    );
  }
}