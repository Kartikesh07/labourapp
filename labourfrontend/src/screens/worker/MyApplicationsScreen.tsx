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
import Animated, { 
  FadeInDown, 
  FadeInUp,
} from 'react-native-reanimated';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { useMyApplications } from '../../hooks/useApplications';
import { Application, WorkerStackParamList } from '../../types';
import { formatTimeAgo, formatSalary } from '../../utils/formatters';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import { JobCardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

const ApplicationCard: React.FC<{ application: Application; index: number }> = ({ application, index }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<WorkerStackParamList>>();
  const job = application.jobs;
  
  const employerProfile = job?.profiles?.employer_profiles;
  const companyName = employerProfile?.company_name || job?.profiles?.name || t('employerProfile.title');

  const navigateToEmployer = () => {
    if (job?.profiles) {
      navigation.navigate('EmployerPublicProfile', { employerData: job.profiles });
    }
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      style={[styles.card, Shadows.sm]}
    >
      <Pressable style={styles.cardHeader} onPress={navigateToEmployer}>
        <View style={styles.cardHeaderLeft}>
          <Avatar name={companyName} uri={job?.profiles?.avatar_url} size={44} />
          <View style={[styles.cardHeaderText, { marginLeft: Spacing.sm }]}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {job?.title || t('navigation.jobs')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.companyText} numberOfLines={1}>
                {companyName}
              </Text>
              <Ionicons name="chevron-forward" size={12} color={Colors.primary} style={{ marginLeft: 2 }} />
            </View>
          </View>
        </View>
        <StatusBadge status={application.status} />
      </Pressable>

      <View style={styles.divider} />

      {job && (
        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{job.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={14} color={Colors.success} />
            <Text style={[styles.detailText, { color: Colors.success, fontWeight: '700' }]}>
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
        <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
        <Text style={styles.timeText}>{t('myApplications.applied')} {formatTimeAgo(application.created_at)}</Text>
      </View>
    </Animated.View>
  );
};

const MyApplicationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useMyApplications();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <Text style={styles.headerTitle}>{t("myApplications.title")}</Text>
        <Text style={styles.headerSubtitle}>
          {data ? `${data.length} ${t('navigation.applications')}` : t('common.loading')}
        </Text>
      </Animated.View>

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
          renderItem={({ item, index }) => <ApplicationCard application={item} index={index} />}
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
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
  cardHeaderText: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  companyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  messageContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  messageLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});

export default MyApplicationsScreen;
