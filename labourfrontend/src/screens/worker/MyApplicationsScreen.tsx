import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { useMyApplications } from '../../hooks/useApplications';
import { Application, WorkerStackParamList } from '../../types';
import { formatTimeAgo, getJobTypeLabel, formatSalary } from '../../utils/formatters';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import { JobCardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

const ApplicationCard: React.FC<{ application: Application }> = ({ application }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<WorkerStackParamList>>();
  const job = application.jobs;
  
  // Note: we fetch the companyName from the deeply nested structure based on our backend select query
  const employerProfile = job?.profiles?.employer_profiles;
  const companyName = employerProfile?.company_name || job?.profiles?.name || t('employerProfile.title');

  const navigateToEmployer = () => {
    if (job?.profiles) {
      navigation.navigate('EmployerPublicProfile', { employerData: job.profiles });
    }
  };

  return (
    <View style={[styles.card, Shadows.sm]}>
      <Pressable style={styles.cardHeader} onPress={navigateToEmployer}>
        <View style={styles.cardHeaderLeft}>
          <Avatar name={companyName} uri={job?.profiles?.avatar_url} size={40} />
          <View style={[styles.cardHeaderText, { marginLeft: Spacing.sm }]}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {job?.title || t('navigation.jobs')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.companyText} numberOfLines={1}>
                {companyName}
              </Text>
              <Ionicons name="chevron-forward" size={12} color={Colors.textMuted} style={{ marginTop: 2, marginLeft: 2 }} />
            </View>
          </View>
        </View>
        <StatusBadge status={application.status} />
      </Pressable>

      {job && (
        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.detailText}>{job.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.detailText}>
              {formatSalary(job.salary_amount, job.salary_period)}
            </Text>
          </View>
        </View>
      )}

      {application.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>{t("myApplications.message")}</Text>
          <Text style={styles.messageText} numberOfLines={2}>
            {application.message}
          </Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.timeText}>{t('myApplications.applied')} {formatTimeAgo(application.created_at)}</Text>
      </View>
    </View>
  );
};

const MyApplicationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useMyApplications();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("myApplications.title")}</Text>
        <Text style={styles.headerSubtitle}>
          {data ? `${data.length} ${t('navigation.applications')}` : t('common.loading')}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <ErrorState message={t("myApplications.retry")} onRetry={refetch} />
      ) : (
        <FlashList
          data={data || []}
          estimatedItemSize={200}
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
          renderItem={({ item }) => <ApplicationCard application={item} />}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title={t("myApplications.noApps")}
              subtitle={t("myApplications.noAppsSubtitle")}
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  companyBadge: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  jobTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  companyText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  messageContainer: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radii.sm,
    padding: Spacing.sm,
  },
  messageLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
    fontSize: 11,
  },
  messageText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  cardFooter: {
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
});

export default MyApplicationsScreen;
