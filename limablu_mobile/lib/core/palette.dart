import 'package:flutter/material.dart';

/// Brand palette
class Palette {
  // Hex: 555b6e, 89b0ae, bee3db, faf9f9, ffd6ba
  static const Color ink = Color(0xFF555B6E);      // deep slate (primary tone)
  static const Color teal = Color(0xFF89B0AE);     // accent / secondary
  static const Color mist = Color(0xFFBEE3DB);     // soft support / tertiary
  static const Color snow = Color(0xFFFAF9F9);     // background light
  static const Color peach = Color(0xFFFFD6BA);    // highlight / warning-ok

  /// Convenience gradients (optional)
  static const LinearGradient brandGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [teal, mist],
  );
}