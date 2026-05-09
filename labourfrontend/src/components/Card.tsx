import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography, Shadows } from '../theme';
import { Job } from '../types';
import { formatSalary, formatTimeAgo, getJobTypeLabel } from '../utils/formatters';

interface JobCardProps {
  job: Job;
  onPress: () => void;
  compact?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onPress, compact = false }) => {
  const companyName =
    job.employer_profiles?.company_name ||
    job.profiles?.employer_profiles?.company_name ||
    job.profiles?.name ||
    'Company';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        Shadows.sm,
        pressed && styles.pressed,
      ]}
    >
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
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{getJobTypeLabel(job.job_type)}</Text>
        </View>
      </View>

      {!compact && (
        <Text style={styles.description} numberOfLines={2}>
          {job.description}
        </Text>
      )}

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.infoText} numberOfLines={1}>
            {job.location}
          </Text>
        </View>
        <View style={styles.salaryBadge}>
          <Text style={styles.salaryText}>
            {formatSalary(job.salary_amount, job.salary_period)}
          </Text>
        </View>
      </View>

      {/* Footer Row */}
      <View style={styles.footer}>
        <Text style={styles.timeText}>{formatTimeAgo(job.created_at)}</Text>
        <View style={styles.applicantsRow}>
          <Ionicons name="people-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.applicantsText}>
            {job.applicants_count} applicant{job.applicants_count !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  companyBadge: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInitial: {
    ...Typography.h3,
    color: Colors.primary,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  company: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.sm,
  },
  typeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textMuted,
    flex: 1,
  },
  salaryBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.sm,
  },
  salaryText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '700',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
  applicantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applicantsText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
});

export default JobCard;
