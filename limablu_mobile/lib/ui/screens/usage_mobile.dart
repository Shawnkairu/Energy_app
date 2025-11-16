import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../data/repository.dart';
import '../../data/api_client.dart';
import '../widgets/glass_card.dart';

class UsageMobile extends StatelessWidget {
  final Repo repo;
  final ApiClient api;

  const UsageMobile({super.key, required this.repo, required this.api});

  @override
  Widget build(BuildContext context) {
    // If you don’t have charts yet, keep a crisp placeholder.
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text("Daily usage (kWh)", style: TextStyle(fontWeight: FontWeight.w700)),
              SizedBox(height: 12),
              _Placeholder(height: 140, label: "Line chart goes here"),
            ],
          ),
        ),
        const SizedBox(height: 12),
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text("Provider mix", style: TextStyle(fontWeight: FontWeight.w700)),
              SizedBox(height: 12),
              _Placeholder(height: 140, label: "Stacked bar goes here"),
            ],
          ),
        ),
      ],
    );
  }
}

class _Placeholder extends StatelessWidget {
  final double height;
  final String label;
  const _Placeholder({required this.height, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppTheme.secondary.withOpacity(.35),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.soft),
      ),
      child: Text(label, style: const TextStyle(color: AppTheme.textMuted)),
    );
  }
}