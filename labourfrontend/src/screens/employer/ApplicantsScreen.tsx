import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  RefreshControl,
  Linking,
  Pressable,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { useJobApplicants, useUpdateApplicationStatus } from '../../hooks/useApplications';
import { EmployerStackParamList, Application, ApplicationStatus } from '../../types';
import { formatTimeAgo } from '../../utils/formatters';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { JobCardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

type RouteParams = RouteProp<EmployerStackParamList, 'Applicants'>;

interface ApplicantCardProps {
  application: Application;
  onUpdateStatus: (status: ApplicationStatus) => void;
  isUpdating: boolean;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({ application, onUpdateStatus, isUpdating }) => {
  const { t } = useTranslation();
  const profile = application.profiles;
  const workerProfile = application.worker_profiles || profile?.worker_profiles;

  const navigation = useNavigation<NativeStackNavigationProp<EmployerStackParamList>>();

  return (
    <View style={[styles.card, Shadows.sm]}>
      {/* Applicant Header */}
      <Pressable 
        style={styles.applicantHeader}
        onPress={() => navigation.navigate('WorkerPublicProfile', { workerData: profile })}
      >
        <Avatar
          name={profile?.name || t('applicants.worker')}
          uri={profile?.avatar_url}
          size={48}
        />
        <View style={styles.applicantInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.applicantName}>{profile?.name || t('applicants.worker')}</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} style={{ marginLeft: 4 }} />
          </View>
          <Text style={styles.applicantMeta}>
            {t('myApplications.applied')} {formatTimeAgo(application.created_at)}
          </Text>
        </View>
        <StatusBadge status={application.status} />
      </Pressable>

      {/* Contact */}
      {profile && (
        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.contactText} numberOfLines={1}>
              {profile.email}
            </Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.contactText}>{profile.phone}</Text>
          </View>
        </View>
      )}

      {/* Worker Skills */}
      {workerProfile?.skills && workerProfile.skills.length > 0 && (
        <View style={styles.skillsRow}>
          {workerProfile.skills.slice(0, 5).map((skill, i) => (
            <View key={i} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Worker Info */}
      {workerProfile && (
        <View style={styles.workerInfoRow}>
          {workerProfile.location && (
            <View style={styles.workerInfoItem}>
              <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.workerInfoText}>{workerProfile.location}</Text>
            </View>
          )}
          {workerProfile.experience && (
            <View style={styles.workerInfoItem}>
              <Ionicons name="trophy-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.workerInfoText}>{workerProfile.experience}</Text>
            </View>
          )}
        </View>
      )}

      {/* Message */}
      {application.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>{t('applicants.message')}</Text>
          <Text style={styles.messageText}>{application.message}</Text>
        </View>
      )}

      {/* Actions */}
      {application.status === 'pending' && (
        <View style={styles.actions}>
          <Button
            title={t('applicants.accept')}
            onPress={() => onUpdateStatus('accepted')}
            size="sm"
            fullWidth={false}
            style={{ flex: 1 }}
            loading={isUpdating}
            icon={<Ionicons name="checkmark" size={16} color={Colors.white} />}
          />
          <Button
            title={t('applicants.reject')}
            onPress={() => onUpdateStatus('rejected')}
            variant="danger"
            size="sm"
            fullWidth={false}
            style={{ flex: 1 }}
            loading={isUpdating}
            icon={<Ionicons name="close" size={16} color={Colors.white} />}
          />
        </View>
      )}

      {/* Contact Action for Accepted */}
      {application.status === 'accepted' && profile?.phone && (
        <Button
          title={t('applicants.callApplicant')}
          onPress={() => Linking.openURL(`tel:${profile.phone}`)}
          variant="outline"
          size="sm"
          icon={<Ionicons name="call" size={16} color={Colors.primary} />}
          style={{ marginTop: Spacing.sm }}
        />
      )}
    </View>
  );
};

const ApplicantsScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const { jobId, jobTitle } = route.params;
  const { data, isLoading, isError, refetch, isRefetching } = useJobApplicants(jobId);
  const updateStatusMutation = useUpdateApplicationStatus();

  const handleUpdateStatus = (applicationId: string, status: ApplicationStatus) => {
    const isAccept = status === 'accepted';
    Alert.alert(
      isAccept ? t('applicants.acceptConfirmTitle') : t('applicants.rejectConfirmTitle'),
      isAccept ? t('applicants.acceptConfirmMessage') : t('applicants.rejectConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: isAccept ? t('applicants.accept') : t('applicants.reject'),
          onPress: async () => {
            try {
              await updateStatusMutation.mutateAsync({ id: applicationId, status });
            } catch (err) {
              Alert.alert(t('common.error'), t('applicants.updateFail'));
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {jobTitle}
        </Text>
        <Text style={styles.headerSubtitle}>
          {data ? `${data.length} ${t('applicants.title').toLowerCase()}` : t('common.loading')}
        </Text>
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
          data={data || []}
          estimatedItemSize={250}
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
            <ApplicantCard
              application={item}
              onUpdateStatus={(status) => handleUpdateStatus(item.id, status)}
              isUpdating={updateStatusMutation.isPending}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={t("applicants.noApplicants")}
              subtitle={t("applicants.noApplicantsSubtitle")}
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
    ...Typography.h2,
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
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  applicantMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  contactText: {
    ...Typography.caption,
    color: Colors.textMuted,
    flex: 1,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xxs,
    marginTop: Spacing.sm,
  },
  skillChip: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  skillText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  workerInfoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  workerInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workerInfoText: {
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

export default ApplicantsScreen;
