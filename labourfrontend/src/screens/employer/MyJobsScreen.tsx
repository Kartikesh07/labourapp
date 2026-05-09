import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { useMyJobs, useDeleteJob } from '../../hooks/useJobs';
import { EmployerStackParamList, Job } from '../../types';
import { formatSalary, formatTimeAgo, getJobTypeLabel } from '../../utils/formatters';
import { JobCardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Button from '../../components/Button';

interface MyJobCardProps {
  job: Job;
  onViewApplicants: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const MyJobCard: React.FC<MyJobCardProps> = ({ job, onViewApplicants, onDelete, isDeleting }) => {
  const { t } = useTranslation();
  
  return (
    <View style={[styles.card, Shadows.sm, !job.is_active && styles.cardInactive]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.jobMeta}>
            {getJobTypeLabel(job.job_type)} • {job.location}
          </Text>
        </View>
        {!job.is_active && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>{t("myJobs.closed")}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Ionicons name="cash-outline" size={16} color={Colors.success} />
          <Text style={styles.statText}>{formatSalary(job.salary_amount, job.salary_period)}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color={Colors.primary} />
          <Text style={styles.statText}>{job.applicants_count} {t('applicants.title').toLowerCase()}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.statText}>{formatTimeAgo(job.created_at)}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Button
          title={t('myJobs.viewApplicants')}
          onPress={onViewApplicants}
          variant="outline"
          size="sm"
          fullWidth={false}
          icon={<Ionicons name="people" size={14} color={Colors.primary} />}
          style={{ flex: 1 }}
        />
        {job.is_active && (
          <Button
            title={t('myJobs.closeJob')}
            onPress={onDelete}
            variant="ghost"
            size="sm"
            fullWidth={false}
            loading={isDeleting}
            icon={<Ionicons name="close-circle-outline" size={14} color={Colors.error} />}
          />
        )}
      </View>
    </View>
  );
};

const MyJobsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<EmployerStackParamList>>();
  const { data: jobs, isLoading, isError, refetch, isRefetching } = useMyJobs();
  const deleteMutation = useDeleteJob();

  const handleDelete = (job: Job) => {
    Alert.alert(
      t('myJobs.closeConfirmTitle'),
      t('myJobs.closeConfirmMessage', { title: job.title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('myJobs.closeJob'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(job.id);
            } catch (err) {
              Alert.alert(t('common.error'), t('myJobs.closeFail'));
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t("myJobs.title")}</Text>
          <Text style={styles.headerSubtitle}>
            {jobs ? `${jobs.length} ${t('navigation.jobs').toLowerCase()}` : t('common.loading')}
          </Text>
        </View>
        <Button
          title={t('navigation.postJob')}
          onPress={() => navigation.navigate('CreateJob')}
          size="sm"
          fullWidth={false}
          icon={<Ionicons name="add" size={18} color={Colors.white} />}
        />
      </View>

      {isLoading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <ErrorState message={t('common.error')} onRetry={refetch} />
      ) : (
        <FlashList
          data={jobs || []}
          estimatedItemSize={150}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <MyJobCard
              job={item}
              onViewApplicants={() =>
                navigation.navigate('Applicants', { jobId: item.id, jobTitle: item.title })
              }
              onDelete={() => handleDelete(item)}
              isDeleting={deleteMutation.isPending}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="briefcase-outline"
              title={t('myJobs.noJobsPosted')}
              subtitle={t('myJobs.noJobsPostedSubtitle')}
              action={
                <Button
                  title={t('myJobs.postFirstJob')}
                  onPress={() => navigation.navigate('CreateJob')}
                  fullWidth={false}
                  icon={<Ionicons name="add" size={18} color={Colors.white} />}
                />
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.bodySm,
    color: Colors.textMuted,
    marginTop: Spacing.xxs,
  },
  listContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  jobTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  jobMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  inactiveBadge: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
  },
  inactiveBadgeText: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
    fontSize: 11,
  },
  cardStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

export default MyJobsScreen;
