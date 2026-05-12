import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  FadeInDown,
  Layout
} from 'react-native-reanimated';
import { Colors, Spacing, Radii, Typography, Shadows } from '../theme';
import { Job } from '../types';
import { formatSalary, formatTimeAgo, getJobTypeLabel } from '../utils/formatters';

interface JobCardProps {
  job: Job;
  onPress: () => void;
  compact?: boolean;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const JOB_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  'full-time': { bg: Colors.primaryMuted, text: Colors.primary },
  'part-time': { bg: Colors.infoLight, text: Colors.primaryDark },
  contract: { bg: Colors.accentMuted, text: Colors.accentDark },
  daily: { bg: Colors.successLight, text: Colors.success },
};

const JobCard: React.FC<JobCardProps> = ({ job, onPress, compact = false, index = 0 }) => {
  const scale = useSharedValue(1);
  
  const companyName =
    job.employer_profiles?.company_name ||
    job.profiles?.employer_profiles?.company_name ||
    job.profiles?.name ||
    'Company';

  const typeColors = JOB_TYPE_COLORS[job.job_type] || {
    bg: Colors.primaryMuted,
    text: Colors.primary,
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      entering={FadeInDown.delay(index * 50).springify().damping(12)}
      layout={Layout.springify()}
      style={[styles.card, Shadows.md, animatedStyle]}
    >
      {/* Accent side stripe */}
      <View style={[styles.stripe, { backgroundColor: typeColors.text }]} />

      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.header}>
          <View style={styles.companyBadge}>
            <Text style={styles.companyInitial}>
              {companyName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>
              {job.title}
            </Text>
            <Text style={styles.company} numberOfLines={1}>
              {companyName}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.locationText}>{job.location}</Text>
            </View>
          </View>
          <View style={styles.salaryContainer}>
            <Text style={styles.salaryText}>
              {formatSalary(job.salary_amount, job.salary_period)}
            </Text>
          </View>
        </View>

        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {job.description}
          </Text>
        )}

        {/* Badges Row */}
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: typeColors.bg }]}>
            <Text style={[styles.typeText, { color: typeColors.text }]}>
              {getJobTypeLabel(job.job_type)}
            </Text>
          </View>
          {job.applicants_count > 0 && (
            <View style={styles.applicantBadge}>
              <Ionicons name="people-outline" size={11} color={Colors.textSecondary} />
              <Text style={styles.applicantText}>
                {job.applicants_count} applicant{job.applicants_count !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          <Text style={styles.timeText}>{formatTimeAgo(job.created_at)}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stripe: {
    width: 4,
    borderTopLeftRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  companyBadge: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInitial: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  headerText: { flex: 1 },
  title: {
    ...Typography.bodyMedium,
    color: Colors.primaryDeep,
    fontWeight: '700',
    fontSize: 15,
  },
  company: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
  salaryContainer: { alignItems: 'flex-end' },
  salaryText: {
    ...Typography.bodySm,
    color: Colors.accent,
    fontWeight: '800',
    fontSize: 13,
  },
  description: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 19,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  typeText: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  applicantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  applicantText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
});

export default JobCard;
