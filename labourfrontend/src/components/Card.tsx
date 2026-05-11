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
  index?: number;
}

const JOB_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  'full-time': { bg: Colors.primaryMuted, text: Colors.primary },
  'part-time': { bg: Colors.infoLight, text: Colors.info },
  contract: { bg: Colors.warningLight, text: Colors.warning },
  daily: { bg: Colors.successLight, text: Colors.success },
};

const JobCard: React.FC<JobCardProps> = ({ job, onPress, compact = false, index = 0 }) => {
  const companyName =
    job.employer_profiles?.company_name ||
    job.profiles?.employer_profiles?.company_name ||
    job.profiles?.name ||
    'Company';

  const typeColors = JOB_TYPE_COLORS[job.job_type] || {
    bg: Colors.primaryMuted,
    text: Colors.primary,
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, Shadows.sm, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.header}>
          <View style={[styles.companyBadge, { backgroundColor: typeColors.bg, borderColor: typeColors.bg }]}>
            <Text style={[styles.companyInitial, { color: typeColors.text }]}>
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

        {/* Footer Row */}
        <View style={styles.footer}>
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.metaText}>{job.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.metaText}>{getJobTypeLabel(job.job_type)}</Text>
            </View>
          </View>
          
          <Text style={styles.timeText}>{formatTimeAgo(job.created_at)}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    padding: Spacing.md,
  },
  pressed: {
    backgroundColor: Colors.surfaceLight,
    opacity: 0.95,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyBadge: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
  },
  companyInitial: {
    ...Typography.h2,
    fontWeight: '800',
  },
  headerText: { flex: 1 },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  company: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  salaryContainer: { 
    alignItems: 'flex-end',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  salaryText: {
    ...Typography.bodySm,
    color: Colors.primary,
    fontWeight: '700',
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 12,
  },
});

export default JobCard;
