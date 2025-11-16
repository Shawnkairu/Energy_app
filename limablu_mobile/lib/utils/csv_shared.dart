// lib/utils/csv_shared.dart

// Build a CSV for Usage (day rows, provider columns)
String usageToCsv(Map<int, Map<String,double>> stack, List<String> providers) {
  final cols = ["day", ...providers];
  final buf = StringBuffer();
  buf.writeln(cols.join(","));

  final days = stack.keys.toList()..sort();
  for (final d in days) {
    final row = [d.toString(), ...providers.map((p) => (stack[d]![p] ?? 0).toStringAsFixed(3))];
    buf.writeln(row.join(","));
  }
  return buf.toString();
}

// Build a CSV for Billing (day, used_kwh, cost, status)
String billToCsv(Iterable<Map<String, dynamic>> bill, {double? totalCost}) {
  final buf = StringBuffer();
  buf.writeln("day,used_kwh,cost,status");
  for (final r in bill) {
    buf.writeln("${r['day']},${(r['used_kwh'] as num).toStringAsFixed(3)},"
        "${(r['cost'] as num).toStringAsFixed(2)},${r['status']}");
  }
  if (totalCost != null) {
    buf.writeln();
    buf.writeln("TOTAL,,${totalCost.toStringAsFixed(2)},");
  }
  return buf.toString();
}