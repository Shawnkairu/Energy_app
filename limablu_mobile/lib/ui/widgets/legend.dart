import 'package:flutter/material.dart';

class ProviderLegend extends StatelessWidget {
  final Map<String, Color> colorMap;
  const ProviderLegend({super.key, required this.colorMap});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12, runSpacing: 8,
      children: colorMap.entries.map((e) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 12, height: 12,
            decoration: BoxDecoration(
              color: e.value,
              borderRadius: BorderRadius.circular(3),
            ),
          ),
          const SizedBox(width: 6),
          Text(e.key),
        ],
      )).toList(),
    );
  }
}