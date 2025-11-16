import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/app_theme.dart';

class BottomControlPanel extends StatelessWidget {
  final int days;
  final ValueChanged<int> onDaysChanged;

  final String billingModel; // "postpaid" | "token" | "subscription"
  final ValueChanged<String> onBillingChanged;

  final double tokenKwh;
  final ValueChanged<double>? onTokenChanged;

  final double allowanceKwh;
  final bool rollover;
  final ValueChanged<double>? onAllowanceChanged;
  final ValueChanged<bool>? onRolloverChanged;

  const BottomControlPanel({
    super.key,
    required this.days,
    required this.onDaysChanged,
    required this.billingModel,
    required this.onBillingChanged,
    required this.tokenKwh,
    this.onTokenChanged,
    required this.allowanceKwh,
    this.onAllowanceChanged,
    required this.rollover,
    this.onRolloverChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 22),
      decoration: BoxDecoration(
        color: AppTheme.card.withOpacity(0.95),
        border: Border(top: BorderSide(color: AppTheme.soft)),
        boxShadow: const [BoxShadow(color: Colors.black54, blurRadius: 16, offset: Offset(0, -6))],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            _Pill(
              icon: Icons.calendar_month_outlined,
              label: "$days d",
              onTap: () => _pickDays(context),
            ),
            const SizedBox(width: 10),
            _Pill(
              icon: Icons.receipt_long_outlined,
              label: _title(billingModel),
              onTap: () => _pickBilling(context),
            ),
            const Spacer(),
            if (billingModel == "token") ...[
              Text("${tokenKwh.toStringAsFixed(0)} kWh"),
              const SizedBox(width: 6),
              IconButton(
                tooltip: "Adjust tokens",
                onPressed: () async {
                  HapticFeedback.selectionClick();
                  final v = await _pickNumber(context, "Tokens (kWh)", tokenKwh, [5,10,20,50]);
                  if (v != null && onTokenChanged != null) onTokenChanged!(v);
                },
                icon: const Icon(Icons.tune),
              ),
            ] else if (billingModel == "subscription") ...[
              Text("${allowanceKwh.toStringAsFixed(0)} kWh"),
              const SizedBox(width: 6),
              IconButton(
                tooltip: "Adjust allowance",
                onPressed: () async {
                  HapticFeedback.selectionClick();
                  final v = await _pickNumber(context, "Allowance (kWh)", allowanceKwh, [10,20,40,60]);
                  if (v != null && onAllowanceChanged != null) onAllowanceChanged!(v);
                },
                icon: const Icon(Icons.tune),
              ),
              const SizedBox(width: 6),
              Row(children: [
                const Text("Rollover"),
                Switch(
                  value: rollover,
                  onChanged: (v) {
                    HapticFeedback.lightImpact();
                    onRolloverChanged?.call(v);
                  },
                ),
              ]),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _pickDays(BuildContext context) async {
    HapticFeedback.selectionClick();
    final v = await showModalBottomSheet<int>(
      context: context,
      backgroundColor: const Color(0xFF0F1419),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
      builder: (_) => _PickerSheet<int>(
        title: "Days",
        options: const [7, 14, 30],
        display: (v) => "$v days",
      ),
    );
    if (v != null) onDaysChanged(v);
  }

  Future<void> _pickBilling(BuildContext context) async {
    HapticFeedback.selectionClick();
    final v = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: const Color(0xFF0F1419),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
      builder: (_) => _PickerSheet<String>(
        title: "Billing",
        options: const ["postpaid","token","subscription"],
        display: _title,
      ),
    );
    if (v != null) onBillingChanged(v);
  }

  Future<double?> _pickNumber(BuildContext context, String title, double current, List<num> options) async {
    return await showModalBottomSheet<double>(
      context: context,
      backgroundColor: const Color(0xFF0F1419),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
      builder: (_) => _PickerSheet<double>(
        title: title,
        options: options.map((e)=> e.toDouble()).toList(),
        display: (v) => v.toStringAsFixed(0),
      ),
    );
  }

  static String _title(String m) => m == "token"
      ? "Prepaid"
      : (m == "subscription" ? "Subscription" : "Postpaid");
}

class _Pill extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _Pill({required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: () { HapticFeedback.lightImpact(); onTap(); },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFF0F1419),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: const Color(0xFF1E2935)),
        ),
        child: Row(children: [
          Icon(icon, size: 18),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
        ]),
      ),
    );
  }
}

class _PickerSheet<T> extends StatelessWidget {
  final String title;
  final List<T> options;
  final String Function(T) display;
  const _PickerSheet({required this.title, required this.options, required this.display});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(height: 4, width: 40, margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: const Color(0xFF1E2935), borderRadius: BorderRadius.circular(999))),
        Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        ...options.map((o) => ListTile(
          onTap: () => Navigator.pop(context, o),
          title: Text(display(o)),
          trailing: const Icon(Icons.chevron_right),
        )),
      ]),
    );
  }
}