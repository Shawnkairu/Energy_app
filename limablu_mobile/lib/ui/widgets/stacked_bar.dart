import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class StackedBar extends StatelessWidget {
  final Map<int, Map<String, double>> data; // day -> {provider:kwh}
  final List<String> providers;
  final Map<String, Color> colors;
  const StackedBar({
    super.key,
    required this.data,
    required this.providers,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final days = data.keys.toList()..sort();
    final groups = <BarChartGroupData>[];

    for (final d in days) {
      double start = 0;
      final rods = <BarChartRodStackItem>[];
      for (final p in providers) {
        final v = (data[d]?[p] ?? 0).toDouble();
        final color = colors[p] ?? Colors.grey;
        rods.add(BarChartRodStackItem(start, start + v, color));
        start += v;
      }
      groups.add(BarChartGroupData(x: d, barRods: [
        BarChartRodData(
          toY: start,
          rodStackItems: rods,
          width: 10,
          borderRadius: BorderRadius.zero,
        ),
      ]));
    }

    return BarChart(BarChartData(
      barGroups: groups,
      gridData: const FlGridData(show: true),
      borderData: FlBorderData(show: false),
      titlesData: FlTitlesData(
        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        leftTitles: AxisTitles(
          sideTitles: SideTitles(showTitles: true, reservedSize: 36),
        ),
        bottomTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            reservedSize: 22,
            getTitlesWidget: (v, _) => Text("${v.toInt()}", style: const TextStyle(fontSize: 10)),
          ),
        ),
      ),
    ));
  }
}