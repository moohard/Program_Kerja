import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFF0066FF);
  static const Color primaryDark = Color(0xFF0055DD);
  static const Color primaryLight = Color(0xFF4D8EFF);

  // Secondary Colors
  static const Color secondary = Color(0xFFFF8A00);
  static const Color secondaryDark = Color(0xFFDD7700);
  static const Color secondaryLight = Color(0xFFFFA44D);

  // Neutral Colors
  static const Color black = Color(0xFF000000);
  static const Color white = Color(0xFFFFFFFF);
  static const Color grey = Color(0xFF9E9E9E);
  static const Color greyLight = Color(0xFFE0E0E0);
  static const Color greyDark = Color(0xFF424242);

  // Semantic Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFFC107);
  static const Color error = Color(0xFFF44336);
  static const Color info = Color(0xFF2196F3);

  // Background Colors
  static const Color background = Color(0xFFF8F9FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color onBackground = Color(0xFF1A1A1A);

  // Text Colors
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF666666);
  static const Color textDisabled = Color(0xFF9E9E9E);

  // Adaptive Colors for Platform Specificity
  static Color adaptivePrimary(BuildContext context) {
    return Theme.of(context).platform == TargetPlatform.iOS
        ? const Color(0xFF007AFF) // iOS system blue
        : primary;
  }

  static Color adaptiveBackground(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? const Color(0xFF121212)
        : background;
  }
}

class AppTextStyles {
  // Headings
  static const TextStyle headlineLarge = TextStyle(
    fontSize: 32.0,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    color: AppColors.textPrimary,
  );

  static const TextStyle headlineMedium = TextStyle(
    fontSize: 28.0,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    color: AppColors.textPrimary,
  );

  static const TextStyle headlineSmall = TextStyle(
    fontSize: 24.0,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  // Body Text
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16.0,
    fontWeight: FontWeight.normal,
    height: 1.5,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14.0,
    fontWeight: FontWeight.normal,
    height: 1.4,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: 12.0,
    fontWeight: FontWeight.normal,
    height: 1.3,
    color: AppColors.textSecondary,
  );

  // Caption
  static const TextStyle caption = TextStyle(
    fontSize: 12.0,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
  );

  // Buttons
  static const TextStyle buttonLarge = TextStyle(
    fontSize: 16.0,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    color: AppColors.white,
  );

  static const TextStyle buttonMedium = TextStyle(
    fontSize: 14.0,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.25,
    color: AppColors.white,
  );

  static const TextStyle buttonSmall = TextStyle(
    fontSize: 12.0,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.25,
    color: AppColors.white,
  );

  // Adaptive text style for platform specificity
  static TextStyle adaptiveTitleLarge(BuildContext context) {
    return Theme.of(context).platform == TargetPlatform.iOS
        ? const TextStyle(
            fontSize: 34.0,
            fontWeight: FontWeight.bold,
            letterSpacing: -0.5,
          )
        : headlineLarge;
  }
}

class AppShadows {
  static const List<BoxShadow> small = [
    BoxShadow(color: Color(0x1A000000), blurRadius: 4.0, offset: Offset(0, 1)),
  ];

  static const List<BoxShadow> medium = [
    BoxShadow(color: Color(0x33000000), blurRadius: 8.0, offset: Offset(0, 2)),
  ];

  static const List<BoxShadow> large = [
    BoxShadow(color: Color(0x4D000000), blurRadius: 16.0, offset: Offset(0, 4)),
  ];

  static List<BoxShadow> button = [
    BoxShadow(
      color: AppColors.primary.withAlpha(75),
      blurRadius: 8.0,
      offset: const Offset(0, 4),
    ),
  ];
}

class AppBorderRadius {
  static const BorderRadius small = BorderRadius.all(Radius.circular(8.0));
  static const BorderRadius medium = BorderRadius.all(Radius.circular(12.0));
  static const BorderRadius large = BorderRadius.all(Radius.circular(16.0));
  static const BorderRadius extraLarge = BorderRadius.all(
    Radius.circular(24.0),
  );
  static const BorderRadius circle = BorderRadius.all(Radius.circular(100.0));
}

class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
}

class AppTransitions {
  static const Duration fast = Duration(milliseconds: 200);
  static const Duration medium = Duration(milliseconds: 300);
  static const Duration slow = Duration(milliseconds: 500);

  static Curve standardCurve = Curves.easeInOut;
  static Curve energeticCurve = Curves.fastOutSlowIn;
}

class AppThemes {
  static ThemeData get lightTheme {
    return ThemeData(
      // Color Scheme
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        primaryContainer: AppColors.primaryLight,
        secondary: AppColors.secondary,
        secondaryContainer: AppColors.secondaryLight,
        surface: AppColors.surface,
        onSurface: AppColors.textPrimary,
        error: AppColors.error,
      ),

      // Text Theme
      textTheme: const TextTheme(
        displayLarge: AppTextStyles.headlineLarge,
        displayMedium: AppTextStyles.headlineMedium,
        displaySmall: AppTextStyles.headlineSmall,
        bodyLarge: AppTextStyles.bodyLarge,
        bodyMedium: AppTextStyles.bodyMedium,
        bodySmall: AppTextStyles.bodySmall,
        labelLarge: AppTextStyles.buttonLarge,
        labelMedium: AppTextStyles.buttonMedium,
        labelSmall: AppTextStyles.buttonSmall,
        titleMedium: AppTextStyles.bodyMedium,
        titleSmall: AppTextStyles.bodySmall,
      ),

      // App Bar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 18.0,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        iconTheme: IconThemeData(color: AppColors.primary, size: 24.0),
      ),

      // Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.white,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          textStyle: AppTextStyles.buttonMedium,
          shape: RoundedRectangleBorder(borderRadius: AppBorderRadius.medium),
          elevation: 2,
          shadowColor: AppColors.primary.withAlpha(75),
        ),
      ),

      // Text Button Theme
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          textStyle: AppTextStyles.buttonMedium.copyWith(
            color: AppColors.primary,
          ),
        ),
      ),

      // Outlined Button Theme
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          textStyle: AppTextStyles.buttonMedium.copyWith(
            color: AppColors.primary,
          ),
          side: const BorderSide(color: AppColors.primary, width: 1.0),
          shape: RoundedRectangleBorder(borderRadius: AppBorderRadius.medium),
        ),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.white,
        contentPadding: const EdgeInsets.all(AppSpacing.md),
        border: OutlineInputBorder(
          borderRadius: AppBorderRadius.medium,
          borderSide: const BorderSide(color: AppColors.greyLight, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.medium,
          borderSide: const BorderSide(color: AppColors.greyLight, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.medium,
          borderSide: const BorderSide(color: AppColors.primary, width: 2.0),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.medium,
          borderSide: const BorderSide(color: AppColors.error, width: 1.0),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.medium,
          borderSide: const BorderSide(color: AppColors.error, width: 2.0),
        ),
        labelStyle: AppTextStyles.bodyMedium.copyWith(
          color: AppColors.textSecondary,
        ),
        hintStyle: AppTextStyles.bodyMedium.copyWith(
          color: AppColors.textDisabled,
        ),
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 2.0,
        shape: RoundedRectangleBorder(borderRadius: AppBorderRadius.medium),
        margin: const EdgeInsets.all(AppSpacing.sm),
        shadowColor: AppColors.black.withAlpha(25),
      ),

      // Dialog Theme
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.surface,
        elevation: 6.0,
        shape: RoundedRectangleBorder(borderRadius: AppBorderRadius.large),
        titleTextStyle: AppTextStyles.headlineSmall,
        contentTextStyle: AppTextStyles.bodyMedium,
      ),

      // Bottom Navigation Bar Theme
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        showSelectedLabels: true,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        elevation: 8.0,
      ),

      // Divider Theme
      dividerTheme: const DividerThemeData(
        color: AppColors.greyLight,
        thickness: 1.0,
        space: 0,
      ),

      // Visual Density
      visualDensity: VisualDensity.adaptivePlatformDensity,

      // Platform-aware styling
      platform: TargetPlatform.android,
      useMaterial3: true,
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,

      // Color Scheme
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primaryLight,
        primaryContainer: AppColors.primaryDark,
        secondary: AppColors.secondaryLight,
        secondaryContainer: AppColors.secondaryDark,
        surface: Color(0xFF1E1E1E),
        onSurface: AppColors.white,
        error: Color(0xFFCF6679),
      ),

      // Text Theme
      textTheme: TextTheme(
        displayLarge: AppTextStyles.headlineLarge.copyWith(
          color: AppColors.white,
        ),
        displayMedium: AppTextStyles.headlineMedium.copyWith(
          color: AppColors.white,
        ),
        displaySmall: AppTextStyles.headlineSmall.copyWith(
          color: AppColors.white,
        ),
        bodyLarge: AppTextStyles.bodyLarge.copyWith(color: AppColors.white),
        bodyMedium: AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
        bodySmall: AppTextStyles.bodySmall.copyWith(color: AppColors.greyLight),
        labelLarge: AppTextStyles.buttonLarge,
        labelMedium: AppTextStyles.buttonMedium,
        labelSmall: AppTextStyles.buttonSmall,
        titleMedium: AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
        titleSmall: AppTextStyles.bodySmall.copyWith(
          color: AppColors.greyLight,
        ),
      ),

      // App Bar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1E1E1E),
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 18.0,
          fontWeight: FontWeight.w600,
          color: AppColors.white,
        ),
        iconTheme: IconThemeData(color: AppColors.primaryLight, size: 24.0),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF2A2A2A),
        contentPadding: const EdgeInsets.all(AppSpacing.md),
        border: OutlineInputBorder(
          borderRadius: AppBorderRadius.medium,
          borderSide: const BorderSide(color: Color(0xFF424242), width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.medium,
          borderSide: const BorderSide(color: Color(0xFF424242), width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.medium,
          borderSide: const BorderSide(
            color: AppColors.primaryLight,
            width: 2.0,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.medium,
          borderSide: const BorderSide(color: Color(0xFFCF6679), width: 1.0),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.medium,
          borderSide: const BorderSide(color: Color(0xFFCF6679), width: 2.0),
        ),
        labelStyle: AppTextStyles.bodyMedium.copyWith(
          color: AppColors.greyLight,
        ),
        hintStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.grey),
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: const Color(0xFF1E1E1E),
        elevation: 2.0,
        shape: RoundedRectangleBorder(borderRadius: AppBorderRadius.medium),
        margin: const EdgeInsets.all(AppSpacing.sm),
        shadowColor: AppColors.black,
      ),

      // Dialog Theme
      dialogTheme: DialogThemeData(
        backgroundColor: const Color(0xFF1E1E1E),
        elevation: 6.0,
        shape: RoundedRectangleBorder(borderRadius: AppBorderRadius.large),
        titleTextStyle: AppTextStyles.headlineSmall.copyWith(
          color: AppColors.white,
        ),
        contentTextStyle: AppTextStyles.bodyMedium.copyWith(
          color: AppColors.white,
        ),
      ),

      // Other theme properties that need to be customized for dark mode
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Color(0xFF1E1E1E),
        selectedItemColor: AppColors.primaryLight,
        unselectedItemColor: AppColors.grey,
        showSelectedLabels: true,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        elevation: 8.0,
      ),

      // Visual Density
      visualDensity: VisualDensity.adaptivePlatformDensity,

      // Platform-aware styling
      platform: TargetPlatform.android,
      useMaterial3: true,
    );
  }

  // Platform-specific theme adjustment
  static ThemeData getPlatformTheme(BuildContext context) {
    final ThemeData baseTheme = Theme.of(context).brightness == Brightness.dark
        ? darkTheme
        : lightTheme;

    final TargetPlatform platform = Theme.of(context).platform;

    if (platform == TargetPlatform.iOS) {
      return baseTheme.copyWith(
        platform: TargetPlatform.iOS,
        // Add iOS specific adjustments here
        appBarTheme: baseTheme.appBarTheme.copyWith(
          titleTextStyle: baseTheme.appBarTheme.titleTextStyle?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        cupertinoOverrideTheme: const CupertinoThemeData(
          primaryColor: AppColors.primary,
        ),
      );
    }

    return baseTheme;
  }
}

// Extension for easy access to theme properties
extension ThemeExtensions on BuildContext {
  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => Theme.of(this).textTheme;
  ColorScheme get colorScheme => Theme.of(this).colorScheme;
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;
}

// Custom theme-aware widget for consistent styling
class ThemedContainer extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadiusGeometry? borderRadius;
  final Color? color;
  final BoxBorder? border;
  final List<BoxShadow>? boxShadow;

  const ThemedContainer({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius,
    this.color,
    this.border,
    this.boxShadow,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? const EdgeInsets.all(AppSpacing.md),
      margin: margin ?? const EdgeInsets.all(0),
      decoration: BoxDecoration(
        color: color ?? Theme.of(context).colorScheme.surface,
        borderRadius: borderRadius ?? AppBorderRadius.medium,
        border: border,
        boxShadow: boxShadow ?? AppShadows.small,
      ),
      child: child,
    );
  }
}
