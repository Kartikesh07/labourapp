import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { WorkerStackParamList } from '../../types';
import { useJobDetail } from '../../hooks/useJobs';
import { useApply } from '../../hooks/useApplications';
import { formatSalary, formatTimeAgo, getJobTypeLabel, formatDate } from '../../utils/formatters';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import { JobCardSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';

type RouteParams = RouteProp<WorkerStackParamList, 'JobDetail'>;

const JobDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NativeStackNavigationProp<WorkerStackParamList>>();
  const { jobId } = route.params;
  const { data: job, isLoading, isError, refetch } = useJobDetail(jobId);
  const applyMutation = useApply();
  const [message, setMessage] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  const companyName =
    job?.employer_profiles?.company_name ||
    job?.profiles?.employer_profiles?.company_name ||
    job?.profiles?.name ||
    'Company';

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync({ job_id: jobId, message: message.trim() || undefined });
      Alert.alert('Success! 🎉', 'Your application has been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err.response?.data?.message || t('createJob.fail');
      Alert.alert(t('common.error'), msg);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !job) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorState message={t('common.error')} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Company Header */}
        <Pressable 
          style={styles.companyCard}
          onPress={() => navigation.navigate('EmployerPublicProfile', { employerData: job.profiles })}
        >
          <Avatar name={companyName} uri={job.profiles?.avatar_url} size={56} />
          <View style={styles.companyInfo}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.companyName}>{companyName}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} style={{ marginTop: Spacing.xxs, marginLeft: 4 }} />
            </View>
          </View>
        </Pressable>

        {/* Tags Row */}
        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Ionicons name="briefcase-outline" size={14} color={Colors.primary} />
            <Text style={styles.tagText}>{getJobTypeLabel(job.job_type)}</Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name="location-outline" size={14} color={Colors.primary} />
            <Text style={styles.tagText}>{job.location}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: Colors.successLight }]}>
            <Ionicons name="cash-outline" size={14} color={Colors.success} />
            <Text style={[styles.tagText, { color: Colors.success }]}>
              {formatSalary(job.salary_amount, job.salary_period)}
            </Text>
          </View>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="people-outline" size={22} color={Colors.primary} />
            <Text style={styles.infoValue}>{job.applicants_count}</Text>
            <Text style={styles.infoLabel}>{t("applicants.title")}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={22} color={Colors.accent} />
            <Text style={styles.infoValue}>{formatTimeAgo(job.created_at)}</Text>
            <Text style={styles.infoLabel}>{t('myApplications.applied')}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="calendar-outline" size={22} color={Colors.info} />
            <Text style={styles.infoValue}>{job.category}</Text>
            <Text style={styles.infoLabel}>{t("createJob.category")}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('createJob.description')}</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("jobDetail.requirements")}</Text>
            {job.requirements.map((req, i) => (
              <View key={i} style={styles.requirementRow}>
                <View style={styles.bullet} />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Apply Form */}
        {showApplyForm && (
          <View style={styles.applyForm}>
            <Text style={styles.sectionTitle}>Your Message (Optional)</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Tell them why you're a great fit..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Apply Bar */}
      <View style={styles.bottomBar}>
        {showApplyForm ? (
          <View style={styles.applyActions}>
            <Button
              title="Cancel"
              onPress={() => setShowApplyForm(false)}
              variant="ghost"
              fullWidth={false}
              style={{ flex: 1 }}
            />
            <Button
              title="Submit Application"
              onPress={handleApply}
              loading={applyMutation.isPending}
              fullWidth={false}
              style={{ flex: 2 }}
            />
          </View>
        ) : (
          <Button
            title="Apply Now"
            onPress={() => setShowApplyForm(true)}
            size="lg"
            icon={<Ionicons name="send" size={18} color={Colors.white} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.xl,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  companyInfo: {
    flex: 1,
  },
  jobTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  companyName: {
    ...Typography.bodySm,
    color: Colors.textMuted,
    marginTop: Spacing.xxs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xxs,
  },
  infoValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  requirementText: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  applyForm: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  applyActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});

export default JobDetailScreen;
