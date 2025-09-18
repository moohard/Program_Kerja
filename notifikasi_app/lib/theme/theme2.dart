import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Custom Theme Configuration for Modern App Design
/// Compatible with Flutter 3.35.3, optimized for iOS & Android
class AppTheme {
  // Private constructor to prevent instantiation
  AppTheme._();

  /// Primary Color Palette - Modern Blue Gradient
  static const Color _primaryBlue = Color(0xFF2563EB);
  static const Color _primaryBlueDark = Color(0xFF1E40AF);
  static const Color _primaryBlueLight = Color(0xFF3B82F6);
  
  /// Secondary Color Palette - Complementary Orange
  static const Color _secondaryOrange = Color(0xFFFF6B35);
  static const Color _secondaryOrangeLight = Color(0xFFFF8F65);
  
  /// Neutral Colors - Sophisticated Gray Scale
  static const Color _neutralGray100 = Color(0xFFF1F5F9);
  static const Color _neutralGray200 = Color(0xFFE2E8F0);
  static const Color _neutralGray300 = Color(0xFFCBD5E1);
  static const Color _neutralGray400 = Color(0xFF94A3B8);
  static const Color _neutralGray500 = Color(0xFF64748B);
  static const Color _neutralGray600 = Color(0xFF475569);
  static const Color _neutralGray700 = Color(0xFF334155);
  static const Color _neutralGray800 = Color(0xFF1E293B);
  static const Color _neutralGray900 = Color(0xFF0F172A);
  
  /// Surface Colors - Clean and Modern
  static const Color _surfaceLight = Color(0xFFFFFFFF);
  static const Color _surfaceDark = Color(0xFF121212);
  static const Color _surfaceVariant = Color(0xFFF5F5F5);
  
  /// Status Colors - Semantic Design
  static const Color _successGreen = Color(0xFF10B981);
  static const Color _warningYellow = Color(0xFFF59E0B);
  static const Color _errorRed = Color(0xFFEF4444);
  static const Color _infoBlue = Color(0xFF3B82F6);

  /// Typography - Optimized Font Sizes
  static const String _primaryFont = 'Inter';
  static const String _displayFont = 'Poppins';

  /// Spacing System - Consistent 8pt Grid
  static const double space4 = 4.0;
  static const double space8 = 8.0;
  static const double space12 = 12.0;
  static const double space16 = 16.0;
  static const double space20 = 20.0;
  static const double space24 = 24.0;
  static const double space32 = 32.0;
  static const double space40 = 40.0;
  static const double space48 = 48.0;
  static const double space64 = 64.0;

  /// Border Radius - Consistent Rounded Corners
  static const double radiusSmall = 8.0;
  static const double radiusMedium = 12.0;
  static const double radiusLarge = 16.0;
  static const double radiusXLarge = 20.0;
  static const double radiusCircular = 999.0;

  /// Elevation System - Material Design 3
  static const double elevation0 = 0.0;
  static const double elevation1 = 1.0;
  static const double elevation2 = 3.0;
  static const double elevation3 = 6.0;
  static const double elevation4 = 8.0;
  static const double elevation5 = 12.0;

  /// Light Theme Configuration
  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    
    // Color Scheme - Light Mode
    colorScheme: const ColorScheme.light(
      primary: _primaryBlue,
      primaryContainer: _primaryBlueLight,
      secondary: _secondaryOrange,
      secondaryContainer: _secondaryOrangeLight,
      surface: _surfaceLight,
      surfaceContainerHighest: _surfaceVariant,
      error: _errorRed,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: _neutralGray900,
      onError: Colors.white,
      outline: _neutralGray300,
    ),

    // AppBar Theme - Clean and Modern
    appBarTheme: const AppBarTheme(
      backgroundColor: _surfaceLight,
      foregroundColor: _neutralGray900,
      elevation: elevation0,
      scrolledUnderElevation: elevation1,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: _neutralGray900,
        fontFamily: _displayFont,
      ),
      systemOverlayStyle: SystemUiOverlayStyle.dark,
    ),

    // Card Theme - Elevated and Clean
    cardTheme: CardThemeData(
      color: _surfaceLight,
      elevation: elevation2,
      shadowColor: _neutralGray900.withAlpha(25),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radiusMedium),
      ),
      margin: const EdgeInsets.all(space8),
    ),

    // Elevated Button - Primary Action
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: _primaryBlue,
        foregroundColor: Colors.white,
        elevation: elevation2,
        shadowColor: _primaryBlue.withAlpha(75),
        padding: const EdgeInsets.symmetric(
          horizontal: space24,
          vertical: space12,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
        ),
        textStyle: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: _primaryFont,
        ),
      ),
    ),

    // Outlined Button - Secondary Action
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: _primaryBlue,
        side: const BorderSide(color: _primaryBlue, width: 1.5),
        padding: const EdgeInsets.symmetric(
          horizontal: space24,
          vertical: space12,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
        ),
        textStyle: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: _primaryFont,
        ),
      ),
    ),

    // Text Button - Tertiary Action
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: _primaryBlue,
        padding: const EdgeInsets.symmetric(
          horizontal: space16,
          vertical: space8,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusSmall),
        ),
        textStyle: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          fontFamily: _primaryFont,
        ),
      ),
    ),

    // Floating Action Button
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: _secondaryOrange,
      foregroundColor: Colors.white,
      elevation: elevation4,
      shape: CircleBorder(),
    ),

    // Input Decoration - Modern Form Fields
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: _neutralGray100,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusMedium),
        borderSide: const BorderSide(color: _neutralGray300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusMedium),
        borderSide: const BorderSide(color: _neutralGray300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusMedium),
        borderSide: const BorderSide(color: _primaryBlue, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusMedium),
        borderSide: const BorderSide(color: _errorRed),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusMedium),
        borderSide: const BorderSide(color: _errorRed, width: 2),
      ),
      labelStyle: const TextStyle(
        color: _neutralGray600,
        fontSize: 16,
        fontFamily: _primaryFont,
      ),
      hintStyle: const TextStyle(
        color: _neutralGray400,
        fontSize: 16,
        fontFamily: _primaryFont,
      ),
      contentPadding: const EdgeInsets.all(space16),
    ),

    // Typography - Comprehensive Text Styles
    textTheme: const TextTheme(
      // Display Styles
      displayLarge: TextStyle(
        fontSize: 32,
        fontWeight: FontWeight.w700,
        color: _neutralGray900,
        fontFamily: _displayFont,
        height: 1.2,
      ),
      displayMedium: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: _neutralGray900,
        fontFamily: _displayFont,
        height: 1.3,
      ),
      displaySmall: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: _neutralGray900,
        fontFamily: _displayFont,
        height: 1.3,
      ),
      
      // Headline Styles
      headlineLarge: TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: _neutralGray900,
        fontFamily: _displayFont,
        height: 1.3,
      ),
      headlineMedium: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: _neutralGray900,
        fontFamily: _primaryFont,
        height: 1.4,
      ),
      headlineSmall: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: _neutralGray900,
        fontFamily: _primaryFont,
        height: 1.4,
      ),
      
      // Title Styles
      titleLarge: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: _neutralGray900,
        fontFamily: _primaryFont,
        height: 1.5,
      ),
      titleMedium: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: _neutralGray800,
        fontFamily: _primaryFont,
        height: 1.4,
      ),
      titleSmall: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: _neutralGray700,
        fontFamily: _primaryFont,
        height: 1.4,
      ),
      
      // Body Styles
      bodyLarge: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: _neutralGray800,
        fontFamily: _primaryFont,
        height: 1.5,
      ),
      bodyMedium: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: _neutralGray700,
        fontFamily: _primaryFont,
        height: 1.5,
      ),
      bodySmall: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: _neutralGray600,
        fontFamily: _primaryFont,
        height: 1.4,
      ),
      
      // Label Styles
      labelLarge: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: _neutralGray700,
        fontFamily: _primaryFont,
        height: 1.4,
      ),
      labelMedium: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: _neutralGray600,
        fontFamily: _primaryFont,
        height: 1.4,
      ),
      labelSmall: TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w500,
        color: _neutralGray500,
        fontFamily: _primaryFont,
        height: 1.4,
      ),
    ),

    // Bottom Navigation Bar
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: _surfaceLight,
      selectedItemColor: _primaryBlue,
      unselectedItemColor: _neutralGray400,
      type: BottomNavigationBarType.fixed,
      elevation: elevation3,
      selectedLabelStyle: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        fontFamily: _primaryFont,
      ),
      unselectedLabelStyle: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        fontFamily: _primaryFont,
      ),
    ),

    // Snackbar Theme
    snackBarTheme: SnackBarThemeData(
      backgroundColor: _neutralGray800,
      contentTextStyle: const TextStyle(
        color: Colors.white,
        fontSize: 14,
        fontFamily: _primaryFont,
      ),
      actionTextColor: _primaryBlueLight,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radiusSmall),
      ),
      behavior: SnackBarBehavior.floating,
    ),

    // Chip Theme
    chipTheme: ChipThemeData(
      backgroundColor: _neutralGray100,
      selectedColor: _primaryBlue.withAlpha(30),
      labelStyle: const TextStyle(
        color: _neutralGray700,
        fontSize: 14,
        fontFamily: _primaryFont,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radiusCircular),
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: space12,
        vertical: space4,
      ),
    ),

    // Progress Indicator
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: _primaryBlue,
      linearTrackColor: _neutralGray200,
      circularTrackColor: _neutralGray200,
    ),

    // Divider Theme
    dividerTheme: const DividerThemeData(
      color: _neutralGray200,
      thickness: 1,
      space: space16,
    ),

    // Icon Theme
    iconTheme: const IconThemeData(
      color: _neutralGray700,
      size: 24,
    ),

    // Primary Icon Theme
    primaryIconTheme: const IconThemeData(
      color: Colors.white,
      size: 24,
    ),
  );

  /// Dark Theme Configuration
  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    
    // Color Scheme - Dark Mode
    colorScheme: const ColorScheme.dark(
      primary: _primaryBlueLight,
      primaryContainer: _primaryBlueDark,
      secondary: _secondaryOrangeLight,
      secondaryContainer: _secondaryOrange,
      surface: _surfaceDark,
      surfaceContainerHighest: Color(0xFF1F1F1F),
      error: _errorRed,
      onPrimary: _neutralGray900,
      onSecondary: _neutralGray900,
      onSurface: _neutralGray100,
      onError: Colors.white,
      outline: _neutralGray600,
    ),

    // AppBar Theme - Dark Mode
    appBarTheme: const AppBarTheme(
      backgroundColor: _surfaceDark,
      foregroundColor: _neutralGray100,
      elevation: elevation0,
      scrolledUnderElevation: elevation1,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: _neutralGray100,
        fontFamily: _displayFont,
      ),
      systemOverlayStyle: SystemUiOverlayStyle.light,
    ),

    // Card Theme - Dark Mode
    cardTheme: CardThemeData(
      color: Color(0xFF1F1F1F),
      elevation: elevation2,
      shadowColor: Colors.black.withAlpha(75),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radiusMedium),
      ),
      margin: const EdgeInsets.all(space8),
    ),

    // Similar theme configurations for dark mode...
    // (Following the same pattern as light theme but with dark colors)
  );

  /// Custom Color Palette for Components
  static const Map<String, Color> statusColors = {
    'success': _successGreen,
    'warning': _warningYellow,
    'error': _errorRed,
    'info': _infoBlue,
  };

  /// Custom Gradient Definitions
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [_primaryBlue, _primaryBlueDark],
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [_secondaryOrange, _secondaryOrangeLight],
  );

  /// Shadow Definitions for Custom Components
  static List<BoxShadow> get lightShadow => [
    BoxShadow(
      color: _neutralGray900.withAlpha(20),
      offset: const Offset(0, 2),
      blurRadius: 8,
      spreadRadius: 0,
    ),
  ];

  static List<BoxShadow> get mediumShadow => [
    BoxShadow(
      color: _neutralGray900.withAlpha(30),
      offset: const Offset(0, 4),
      blurRadius: 12,
      spreadRadius: 0,
    ),
  ];

  static List<BoxShadow> get heavyShadow => [
    BoxShadow(
      color: _neutralGray900.withAlpha(40),
      offset: const Offset(0, 8),
      blurRadius: 24,
      spreadRadius: 0,
    ),
  ];
}

/// Extension for easy theme access in widgets
extension ThemeExtension on BuildContext {
  ThemeData get theme => Theme.of(this);
  ColorScheme get colorScheme => Theme.of(this).colorScheme;
  TextTheme get textTheme => Theme.of(this).textTheme;
}