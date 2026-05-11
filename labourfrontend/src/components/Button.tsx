import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, Radii, Typography, Shadows } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    if (!isDisabled) {
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 40,
        bounciness: 0,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 4,
      }).start();
    }
  };

  const variantStyle = styles[variant as keyof typeof styles] as ViewStyle | undefined;
  const sizeStyle = styles[`size_${size}` as keyof typeof styles] as ViewStyle | undefined;
  const textVariantStyle = styles[`text_${variant}` as keyof typeof styles] as TextStyle | undefined;
  const textSizeStyle = styles[`text_${size}` as keyof typeof styles] as TextStyle | undefined;

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.base,
          variantStyle,
          sizeStyle,
          variant === 'primary' && !isDisabled && Shadows.md,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
            size="small"
          />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.text,
                textVariantStyle,
                textSizeStyle,
                icon ? { marginLeft: Spacing.xs } : undefined,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md, // Changed from full to md for modern look
  },
  disabled: { opacity: 0.45 },

  // ─── Variants ────────────────────────────────
  primary: { backgroundColor: Colors.primary },
  accent: { backgroundColor: Colors.accent },
  secondary: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.error },

  // ─── Sizes ───────────────────────────────────
  size_sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, minHeight: 40 },
  size_md: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, minHeight: 48 },
  size_lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 56 },

  // ─── Text ────────────────────────────────────
  text: { ...Typography.button } as TextStyle,
  text_primary: { color: Colors.white },
  text_accent: { color: Colors.white },
  text_secondary: { color: Colors.primary },
  text_outline: { color: Colors.textPrimary },
  text_ghost: { color: Colors.primary },
  text_danger: { color: Colors.white },
  text_sm: { fontSize: 14 },
  text_md: { fontSize: 16 },
  text_lg: { fontSize: 17 },
});

export default Button;
