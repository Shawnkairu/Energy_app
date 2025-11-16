import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ===== Palette =====
  static const Color primary = Color(0xFF89B0AE); // teal/green-gray
  static const Color secondary = Color(0xFFBEE3DB); // pale teal
  static const Color accent = Color(0xFFFFD6BA); // peach highlight
  static const Color background = Color(0xFFFAF9F9); // soft white
  static const Color surface = Colors.white;

  // Text colors
  static const Color text = Colors.black87;
  static const Color textMuted = Colors.black54;

  // Support colors kept for existing widgets
  static const Color card = surface;         // for GlassCard, etc.
  static const Color soft = Color(0xFFE9E9E9); // subtle borders/dividers

  /// Light theme (white pages everywhere)
  static ThemeData light() {
    final baseText = GoogleFonts.robotoTextTheme(); // Roboto everywhere

    final colors = ColorScheme(
      brightness: Brightness.light,
      primary: primary,
      onPrimary: Colors.white,
      secondary: secondary,
      onSecondary: Colors.black,
      surface: surface,
      onSurface: text,
      background: background,
      onBackground: text,
      error: Colors.red,
      onError: Colors.white,
      // Material 3 extra roles:
      tertiary: accent,
      onTertiary: Colors.black,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colors,
      scaffoldBackgroundColor: background,
      // Roboto across the app
      textTheme: baseText.apply(
        bodyColor: text,
        displayColor: text,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        foregroundColor: text,
        elevation: 0,
        centerTitle: false,
      ),
      // NOTE: Flutter recent versions want CardThemeData
      cardTheme: const CardThemeData(
        color: surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(18)),
          side: BorderSide(color: soft, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: soft),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primary, width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primary,
          side: const BorderSide(color: primary),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: secondary,
        labelStyle: baseText.labelMedium?.copyWith(color: text),
        selectedColor: accent,
        side: const BorderSide(color: soft),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: primary,
        unselectedItemColor: Colors.black45,
        type: BottomNavigationBarType.fixed,
        showUnselectedLabels: true,
      ),
      dividerColor: soft,
      splashColor: secondary.withOpacity(0.25),
      highlightColor: secondary.withOpacity(0.15),
    );
  }
}