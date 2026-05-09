import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radii, Spacing } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const SkeletonPulse: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = Radii.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: Colors.shimmer,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ─── Pre-built Skeletons ─────────────────────────────────────────

export const JobCardSkeleton: React.FC = () => (
  <View style={skeletonStyles.card}>
    <View style={skeletonStyles.row}>
      <SkeletonPulse width={44} height={44} borderRadius={Radii.md} />
      <View style={skeletonStyles.flex}>
        <SkeletonPulse width="70%" height={16} />
        <SkeletonPulse width="40%" height={12} style={{ marginTop: 6 }} />
      </View>
      <SkeletonPulse width={60} height={22} borderRadius={Radii.sm} />
    </View>
    <SkeletonPulse height={14} style={{ marginTop: Spacing.sm }} />
    <SkeletonPulse width="80%" height={14} style={{ marginTop: 6 }} />
    <View style={[skeletonStyles.row, { marginTop: Spacing.sm }]}>
      <SkeletonPulse width="40%" height={14} />
      <SkeletonPulse width={80} height={22} borderRadius={Radii.sm} />
    </View>
  </View>
);

export const ProfileSkeleton: React.FC = () => (
  <View style={skeletonStyles.profileContainer}>
    <SkeletonPulse width={80} height={80} borderRadius={40} />
    <SkeletonPulse width="50%" height={20} style={{ marginTop: Spacing.md }} />
    <SkeletonPulse width="30%" height={14} style={{ marginTop: Spacing.xs }} />
    <View style={[skeletonStyles.card, { marginTop: Spacing.lg }]}>
      <SkeletonPulse width="60%" height={16} />
      <SkeletonPulse height={14} style={{ marginTop: Spacing.sm }} />
      <SkeletonPulse width="80%" height={14} style={{ marginTop: 6 }} />
    </View>
  </View>
);

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
});

export default SkeletonPulse;
