import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { useCreateJob } from '../../hooks/useJobs';
import { createJobSchema } from '../../utils/validators';
import { JobType, SalaryPeriod } from '../../types';
import Button from '../../components/Button';
import Input from '../../components/Input';

const CreateJobScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const createMutation = useCreateJob();

  const JOB_TYPES: { value: JobType; label: string }[] = [
    { value: 'full-time', label: t('workerHome.fullTime') },
    { value: 'part-time', label: t('workerHome.partTime') },
    { value: 'contract', label: t('workerHome.contract') },
    { value: 'daily', label: t('workerHome.daily') },
  ];

  const SALARY_PERIODS: { value: SalaryPeriod; label: string }[] = [
    { value: 'hourly', label: t('workerHome.hourly', 'Hourly') },
    { value: 'daily', label: t('workerHome.daily') },
    { value: 'weekly', label: t('workerHome.weekly', 'Weekly') },
    { value: 'monthly', label: t('workerHome.monthly', 'Monthly') },
  ];

  const CATEGORIES = [
    t('categories.CONSTRUCTION'), t('categories.PLUMBING'), t('categories.ELECTRICAL'), t('categories.PAINTING'),
    t('categories.CARPENTRY', 'Carpentry'), t('categories.CLEANING', 'Cleaning'), t('categories.GARDENING', 'Gardening'), t('categories.DRIVING', 'Driving'),
    t('categories.COOKING', 'Cooking'), t('categories.SECURITY', 'Security'), t('categories.OTHER'),
  ];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState<JobType>('full-time');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>('monthly');
  const [location, setLocation] = useState('');
  const [requirements, setRequirements] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleCreate = async () => {
    setFieldErrors({});

    const payload = {
      title,
      description,
      category,
      job_type: jobType,
      salary_amount: parseFloat(salaryAmount) || 0,
      salary_period: salaryPeriod,
      location,
      requirements: requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
    };

    const result = createJobSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((e: any) => {
        if (e.path[0]) errors[e.path[0] as string] = e.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await createMutation.mutateAsync(payload);
      Alert.alert(t('createJob.successTitle', 'Job Posted! 🎉'), t('createJob.successMessage', 'Your job listing is now live.'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('createJob.fail', 'Failed to create job'));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.springify()}>
            <Text style={styles.pageTitle}>{t('createJob.title')}</Text>
            <Text style={styles.pageSubtitle}>{t('createJob.subtitle', 'Fill in the details to attract the best workers')}</Text>
          </Animated.View>

          {/* Job Info */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.section, Shadows.md]}>
            <Text style={styles.sectionTitle}>{t('jobDetail.aboutJob')}</Text>

            <Input
              label={t('createJob.jobTitle')}
              placeholder={t('createJob.titlePlaceholder', 'e.g. Experienced Plumber')}
              value={title}
              onChangeText={setTitle}
              leftIcon="briefcase-outline"
              error={fieldErrors.title}
            />

            <Input
              label={t('createJob.description')}
              placeholder={t('createJob.descPlaceholder', 'Describe the job in detail...')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              error={fieldErrors.description}
            />

            <Text style={styles.inputLabel}>{t("createJob.category")}</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => {
                const isActive = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{cat}</Text>
                  </Pressable>
                );
              })}
            </View>
            {fieldErrors.category && (
              <Text style={styles.errorText}>{fieldErrors.category}</Text>
            )}

            <Text style={[styles.inputLabel, { marginTop: Spacing.lg }]}>{t("createJob.jobType")}</Text>
            <View style={styles.chipRow}>
              {JOB_TYPES.map((jt) => {
                const isActive = jobType === jt.value;
                return (
                  <Pressable
                    key={jt.value}
                    onPress={() => setJobType(jt.value)}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{jt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Compensation */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={[styles.section, Shadows.md]}>
            <Text style={styles.sectionTitle}>{t('jobDetail.salary')}</Text>

            <Input
              label={t('createJob.salaryAmount')}
              placeholder="e.g. 25000"
              value={salaryAmount}
              onChangeText={setSalaryAmount}
              keyboardType="numeric"
              leftIcon="cash-outline"
              error={fieldErrors.salary_amount}
            />

            <Text style={styles.inputLabel}>{t('createJob.salaryPeriod')}</Text>
            <View style={styles.chipRow}>
              {SALARY_PERIODS.map((sp) => {
                const isActive = salaryPeriod === sp.value;
                return (
                  <Pressable
                    key={sp.value}
                    onPress={() => setSalaryPeriod(sp.value)}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{sp.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Location & Requirements */}
          <Animated.View entering={FadeInDown.delay(600).springify()} style={[styles.section, Shadows.md]}>
            <Text style={styles.sectionTitle}>{t('jobDetail.title')}</Text>

            <Input
              label={t('createJob.location')}
              placeholder="e.g. Mumbai, Maharashtra"
              value={location}
              onChangeText={setLocation}
              leftIcon="location-outline"
              error={fieldErrors.location}
            />

            <Input
              label={t('jobDetail.requirements')}
              placeholder={t('createJob.reqPlaceholder', 'Must have 2+ years experience\nOwn tools preferred')}
              value={requirements}
              onChangeText={setRequirements}
              multiline
              numberOfLines={4}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).springify()}>
            <Button
              title={t('createJob.submit')}
              onPress={handleCreate}
              loading={createMutation.isPending}
              size="lg"
              icon={<Ionicons name="checkmark-circle" size={20} color={Colors.white} />}
              style={{ marginTop: Spacing.sm }}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.xl,
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    letterSpacing: -0.2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  chipTextActive: {
    color: Colors.white,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xxs,
    fontWeight: '600',
  },
});

export default CreateJobScreen;
