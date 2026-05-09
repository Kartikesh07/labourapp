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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography } from '../../theme';
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
          <Text style={styles.pageTitle}>{t('createJob.title')}</Text>
          <Text style={styles.pageSubtitle}>{t('createJob.subtitle', 'Fill in the details to attract the best workers')}</Text>

          {/* Job Info */}
          <View style={styles.section}>
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

            {/* Category Chips */}
            <Text style={styles.inputLabel}>{t("createJob.category")}</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  title={cat}
                  onPress={() => setCategory(cat)}
                  variant={category === cat ? 'primary' : 'secondary'}
                  size="sm"
                  fullWidth={false}
                />
              ))}
            </View>
            {fieldErrors.category && (
              <Text style={styles.errorText}>{fieldErrors.category}</Text>
            )}

            {/* Job Type */}
            <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>{t("createJob.jobType")}</Text>
            <View style={styles.chipRow}>
              {JOB_TYPES.map((jt) => (
                <Button
                  key={jt.value}
                  title={jt.label}
                  onPress={() => setJobType(jt.value)}
                  variant={jobType === jt.value ? 'primary' : 'secondary'}
                  size="sm"
                  fullWidth={false}
                />
              ))}
            </View>
          </View>

          {/* Compensation */}
          <View style={styles.section}>
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
              {SALARY_PERIODS.map((sp) => (
                <Button
                  key={sp.value}
                  title={sp.label}
                  onPress={() => setSalaryPeriod(sp.value)}
                  variant={salaryPeriod === sp.value ? 'primary' : 'secondary'}
                  size="sm"
                  fullWidth={false}
                />
              ))}
            </View>
          </View>

          {/* Location & Requirements */}
          <View style={styles.section}>
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
          </View>

          <Button
            title={t('createJob.submit')}
            onPress={handleCreate}
            loading={createMutation.isPending}
            size="lg"
            icon={<Ionicons name="checkmark-circle" size={20} color={Colors.white} />}
            style={{ marginTop: Spacing.sm }}
          />
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
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    ...Typography.bodySm,
    color: Colors.textMuted,
    marginTop: Spacing.xxs,
    marginBottom: Spacing.xl,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xxs,
  },
});

export default CreateJobScreen;
