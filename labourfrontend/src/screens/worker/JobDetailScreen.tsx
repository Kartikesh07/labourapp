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
import Animated, { 
  FadeInDown, 
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { WorkerStackParamList } from '../../types';
import { useJobDetail } from '../../hooks/useJobs';
import { useApply } from '../../hooks/useApplications';
import { formatSalary, formatTimeAgo, getJobTypeLabel } from '../../utils/formatters';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import { JobCardSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';

type RouteParams = RouteProp<WorkerStackParamList, 'JobDetail'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
        <Animated.View entering={FadeInUp.springify()}>
          <Pressable 
            style={styles.companyCard}
            onPress={() => navigation.navigate('EmployerPublicProfile', { employerData: job.profiles })}
          >
            <Avatar name={companyName} uri={job.profiles?.avatar_url} size={64} />
            <View style={styles.companyInfo}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.companyName}>{companyName}</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} style={{ marginLeft: 4 }} />
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Tags Row */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.tagsRow}>
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
        </Animated.View>

        {/* Info Cards */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.infoRow}>
          <View style={[styles.infoCard, Shadows.sm]}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.infoValue}>{job.applicants_count}</Text>
            <Text style={styles.infoLabel}>{t("applicants.title")}</Text>
          </View>
          <View style={[styles.infoCard, Shadows.sm]}>
            <View style={[styles.infoIconWrap, { backgroundColor: Colors.accentMuted }]}>
              <Ionicons name="time-outline" size={20} color={Colors.accent} />
            </View>
            <Text style={styles.infoValue}>{formatTimeAgo(job.created_at)}</Text>
            <Text style={styles.infoLabel}>{t('myApplications.applied')}</Text>
          </View>
          <View style={[styles.infoCard, Shadows.sm]}>
            <View style={[styles.infoIconWrap, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="calendar-outline" size={20} color={Colors.info} />
            </View>
            <Text style={styles.infoValue} numberOfLines={1}>{job.category}</Text>
            <Text style={styles.infoLabel}>{t("createJob.category")}</Text>
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={[styles.section, Shadows.sm]}>
          <Text style={styles.sectionTitle}>{t('createJob.description')}</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </Animated.View>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <Animated.View entering={FadeInDown.delay(700).springify()} style={[styles.section, Shadows.sm]}>
            <Text style={styles.sectionTitle}>{t("jobDetail.requirements")}</Text>
            {job.requirements.map((req, i) => (
              <View key={i} style={styles.requirementRow}>
                <View style={styles.bullet} />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Apply Form */}
        {showApplyForm && (
          <Animated.View entering={FadeInDown.springify()} style={[styles.applyForm, Shadows.md]}>
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
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Apply Bar */}
      <View style={[styles.bottomBar, Shadows.lg]}>
        {showApplyForm ? (
          <View style={styles.applyActions}>
            <Button
              title="Cancel"
              onPress={() => setShowApplyForm(false)}
              variant="secondary"
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
    marginBottom: Spacing.xl,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  companyInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tagText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 4,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontWeight: '400',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  requirementText: {
    fontSize: 15,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  applyForm: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  messageInput: {
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    minHeight: 120,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
  },
  applyActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});

export default JobDetailScreen;
