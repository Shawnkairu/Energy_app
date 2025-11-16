// lib/services/prefs.dart
import 'package:shared_preferences/shared_preferences.dart';

class AppPrefs {
  static const _kOrderKey = 'deduction_order';
  late final SharedPreferences _sp;

  Future<void> init() async {
    _sp = await SharedPreferences.getInstance();
  }

  Future<List<String>> getDeductionOrder() async {
    final v = _sp.getStringList(_kOrderKey);
    return v ?? const ['allowance', 'tokens', 'postpaid'];
  }

  Future<void> setDeductionOrder(List<String> order) async {
    await _sp.setStringList(_kOrderKey, order);
  }

  /// Rotate current order forward, e.g. [allowance, tokens, postpaid] ->
  /// [tokens, postpaid, allowance]. Returns the new order.
  Future<List<String>> rotateDeductionOrder() async {
    final cur = await getDeductionOrder();
    if (cur.isEmpty) return cur;
    final next = [...cur.skip(1), cur.first];
    await setDeductionOrder(next);
    return next;
  }
}