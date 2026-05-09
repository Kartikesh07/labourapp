import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { useMyJobs } from '../../hooks/useJobs';
import { useAuthStore } from '../../store/authStore';
import { EmployerStackParamList } from '../../types';
import { JobCardSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<EmployerStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const { data: jobs, isLoading, isError, refetch, isRefetching } = useMyJobs();

  const activeJobs = jobs?.filter((j) => j.is_active) || [];
  const totalApplicants = jobs?.reduce((sum, j) => sum + (j.applicants_count || 0), 0) || 0;

  const firstName = user?.name?.split(' ')[0] || t('common.there', 'there');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{t('employerDashboard.greeting', { name: firstName })}</Text>
          <Text style={styles.subGreeting}>{t('employerDashboard.subGreeting')}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.primaryMuted }]}>
            <Ionicons name="briefcase" size={28} color={Colors.primary} />
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {activeJobs.length}
            </Text>
            <Text style={styles.statLabel}>{t('employerDashboard.activeJobs')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.successLight }]}>
            <Ionicons name="people" size={28} color={Colors.success} />
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {totalApplicants}
            </Text>
            <Text style={styles.statLabel}>{t('employerDashboard.totalApplicants')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.warningLight }]}>
            <Ionicons name="document-text" size={28} color={Colors.warning} />
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {jobs?.length || 0}
            </Text>
            <Text style={styles.statLabel}>{t('employerDashboard.allJobs')}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('employerDashboard.quickActions')}</Text>
        <Pressable
          onPress={() => navigation.navigate('CreateJob')}
          style={({ pressed }) => [
            styles.actionCard,
            Shadows.sm,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>{t('employerDashboard.postNewJob')}</Text>
            <Text style={styles.actionDesc}>{t('employerDashboard.postNewJobDesc')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </Pressable>

        {/* Recent Jobs */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          {t('employerDashboard.recentJobs')}
        </Text>

        {isLoading ? (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        ) : isError ? (
          <ErrorState message={t('common.error')} onRetry={refetch} />
        ) : activeJobs.length === 0 ? (
          <View style={styles.emptyJobs}>
            <Ionicons name="briefcase-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{t('myJobs.noJobs')}</Text>
            <Text style={styles.emptySubtext}>{t('myJobs.noJobsSubtitle')}</Text>
          </View>
        ) : (
          activeJobs.slice(0, 3).map((job) => (
            <Pressable
              key={job.id}
              onPress={() =>
                navigation.navigate('Applicants', {
                  jobId: job.id,
                  jobTitle: job.title,
                })
              }
              style={({ pressed }) => [
                styles.jobCard,
                Shadows.sm,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.jobCardLeft}>
                <Text style={styles.jobCardTitle} numberOfLines={1}>
                  {job.title}
                </Text>
                <Text style={styles.jobCardLocation} numberOfLines={1}>
                  {job.location}
                </Text>
              </View>
              <View style={styles.jobCardRight}>
                <View style={styles.applicantsBadge}>
                  <Ionicons name="people" size={14} color={Colors.primary} />
                  <Text style={styles.applicantsBadgeText}>
                    {job.applicants_count}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subGreeting: {
    ...Typography.bodySm,
    color: Colors.textMuted,
    marginTop: Spacing.xxs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  statValue: {
    ...Typography.h2,
    fontSize: 24,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 11,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  actionDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyJobs: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.xs,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jobCardLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  jobCardTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  jobCardLocation: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  jobCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  applicantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
  },
  applicantsBadgeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default DashboardScreen;
