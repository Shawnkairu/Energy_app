import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

const _kAllowanceKey = 'allowance_state_v1';

/// Serializable snapshot of the user’s allowance state.
class AllowanceState {
  final double monthlyAllowanceKwh;
  final double remainingKwh;
  final bool rollover;
  final DateTime lastReset; // start of current period (month)

  AllowanceState({
    required this.monthlyAllowanceKwh,
    required this.remainingKwh,
    required this.rollover,
    required this.lastReset,
  });

  AllowanceState copyWith({
    double? monthlyAllowanceKwh,
    double? remainingKwh,
    bool? rollover,
    DateTime? lastReset,
  }) {
    return AllowanceState(
      monthlyAllowanceKwh: monthlyAllowanceKwh ?? this.monthlyAllowanceKwh,
      remainingKwh: remainingKwh ?? this.remainingKwh,
      rollover: rollover ?? this.rollover,
      lastReset: lastReset ?? this.lastReset,
    );
  }

  Map<String, dynamic> toJson() => {
        'monthlyAllowanceKwh': monthlyAllowanceKwh,
        'remainingKwh': remainingKwh,
        'rollover': rollover,
        'lastReset': lastReset.toIso8601String(),
      };

  static AllowanceState fromJson(Map<String, dynamic> m) => AllowanceState(
        monthlyAllowanceKwh: (m['monthlyAllowanceKwh'] as num).toDouble(),
        remainingKwh: (m['remainingKwh'] as num).toDouble(),
        rollover: m['rollover'] as bool,
        lastReset: DateTime.parse(m['lastReset'] as String),
      );
}

class AllowanceService {
  SharedPreferences? _sp;
  AllowanceState? _state;

  /// Expose current state to the UI.
  AllowanceState? get state => _state;

  /// Load from SharedPreferences, or create a default.
  Future<void> load() async {
    _sp = await SharedPreferences.getInstance();
    final raw = _sp!.getString(_kAllowanceKey);
    if (raw != null) {
      final json = jsonDecode(raw) as Map<String, dynamic>;
      _state = AllowanceState.fromJson(json);
    } else {
      // sensible defaults for a brand-new user
      final now = DateTime.now();
      final startOfMonth = DateTime(now.year, now.month, 1);
      _state = AllowanceState(
        monthlyAllowanceKwh: 100,
        remainingKwh: 100,
        rollover: true,
        lastReset: startOfMonth,
      );
      await _save();
    }
  }

  /// If we’ve crossed into a new month, reset period.
  Future<void> ensureCurrentPeriod() async {
    if (_state == null) return;
    final now = DateTime.now();
    final currentPeriod = DateTime(now.year, now.month, 1);
    final lastPeriod = DateTime(_state!.lastReset.year, _state!.lastReset.month, 1);

    if (currentPeriod.isAfter(lastPeriod)) {
      // new month
      double newRemaining = _state!.monthlyAllowanceKwh;
      if (_state!.rollover) {
        newRemaining += _state!.remainingKwh; // carryover any unused
      }
      _state = _state!.copyWith(
        remainingKwh: newRemaining,
        lastReset: currentPeriod,
      );
      await _save();
    }
  }

  /// Update plan settings (and optionally mark as newly selected plan).
  Future<void> setPlan({
    required double monthlyAllowanceKwh,
    required bool rollover,
    bool newPlan = false,
  }) async {
    if (_state == null) await load();
    final s = _state!;
    // If selecting a brand-new plan, reset remaining to the plan amount (fresh start).
    final newRemaining = newPlan ? monthlyAllowanceKwh : s.remainingKwh;

    _state = s.copyWith(
      monthlyAllowanceKwh: monthlyAllowanceKwh,
      rollover: rollover,
      remainingKwh: newRemaining,
    );
    await _save();
  }

  /// Deduct used allowance and persist. Returns how much was actually deducted.
  Future<double> consume(double kwh) async {
    if (_state == null) await load();
    final s = _state!;
    final double deduct = kwh.clamp(0.0, s.remainingKwh);
    _state = s.copyWith(remainingKwh: s.remainingKwh - deduct);
    await _save();
    return deduct;
  }

  Future<void> _save() async {
    if (_sp == null) _sp = await SharedPreferences.getInstance();
    await _sp!.setString(_kAllowanceKey, jsonEncode(_state!.toJson()));
  }
}