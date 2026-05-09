import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Radii, Typography } from '../../theme';
import { AuthStackParamList, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema } from '../../utils/validators';
import Button from '../../components/Button';
import Input from '../../components/Input';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

const ROLES: { value: UserRole; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  {
    value: 'worker',
    label: 'Worker',
    icon: 'hammer-outline',
    description: 'I\'m looking for work',
  },
  {
    value: 'employer',
    label: 'Employer',
    icon: 'business-outline',
    description: 'I want to hire workers',
  },
];

const PROFESSIONS = [
    'Plumber',
    'Electrician',
    'Carpenter',
    'Painter',
    'Construction Worker',
    'Mason',
    'Welder',
    'Mechanic',
    'Cleaner',
    'Gardener',
    'Driver',
    'Cook',
    'Security Guard'
];

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { register, isLoading, error, clearError } = useAuth();

  const PROFESSIONS = [
    t('professions.PLUMBER'),
    t('professions.ELECTRICIAN'),
    t('professions.CARPENTER'),
    t('professions.PAINTER'),
    t('categories.CONSTRUCTION'),
    t('professions.MASON'),
    t('professions.LABOURER'),
    t('categories.OTHER'),
  ];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [skill, setSkill] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSkillModalVisible, setIsSkillModalVisible] = useState(false);

  const handleRegister = async () => {
    clearError();
    setFieldErrors({});

    const result = registerSchema.safeParse({ 
      name, email, phone, password, location, role: role || undefined, skills: role === 'worker' && skill ? [skill] : undefined 
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((e: any) => {
        if (e.path[0]) errors[e.path[0] as string] = e.message;
      });
      setFieldErrors(errors);
      return;
    }

    await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      location: location.trim(),
      role: role as UserRole,
      skills: role === 'worker' ? [skill] : undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{t('auth.registerTitle')}</Text>
            <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Role Selection */}
          <Text style={styles.sectionLabel}>{t('auth.roleLabel')}</Text>
          <View style={styles.roleRow}>
            <Pressable
              onPress={() => {
                setRole('worker');
                setFieldErrors((prev) => ({ ...prev, role: '' }));
              }}
              style={[
                styles.roleCard,
                role === 'worker' && styles.roleCardActive,
              ]}
            >
              <Ionicons
                name="hammer-outline"
                size={28}
                color={role === 'worker' ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.roleLabel,
                  role === 'worker' && styles.roleLabelActive,
                ]}
              >
                {t('auth.workerLabel')}
              </Text>
              <Text style={styles.roleDesc}>{t('auth.workerDesc')}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setRole('employer');
                setFieldErrors((prev) => ({ ...prev, role: '' }));
              }}
              style={[
                styles.roleCard,
                role === 'employer' && styles.roleCardActive,
              ]}
            >
              <Ionicons
                name="business-outline"
                size={28}
                color={role === 'employer' ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.roleLabel,
                  role === 'employer' && styles.roleLabelActive,
                ]}
              >
                {t('auth.employerLabel')}
              </Text>
              <Text style={styles.roleDesc}>{t('auth.employerDesc')}</Text>
            </Pressable>
          </View>
          {fieldErrors.role && (
            <Text style={styles.errorText}>{fieldErrors.role}</Text>
          )}

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label={t('profile.name')}
              placeholder={t('auth.namePlaceholder')}
              leftIcon="person-outline"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              error={fieldErrors.name}
            />

            <Input
              label={t('auth.emailLabel')}
              placeholder={t('auth.emailPlaceholder')}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={fieldErrors.email}
            />

            <Input
              label={t('auth.phoneLabel')}
              placeholder="9876543210"
              leftIcon="call-outline"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={fieldErrors.phone}
            />

            <Input
              label={t('auth.passwordLabel')}
              placeholder={t('auth.passwordHint')}
              leftIcon="lock-closed-outline"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={fieldErrors.password}
            />

            <Input
              label={t('auth.locationLabel')}
              placeholder="e.g. Mumbai, Maharashtra"
              leftIcon="location-outline"
              value={location}
              onChangeText={setLocation}
              error={fieldErrors.location}
            />

            {role === 'worker' && (
              <View style={styles.skillInputWrapper}>
                <Text style={styles.inputLabel}>{t('auth.professionLabel')}</Text>
                <Pressable
                  style={[styles.skillSelector, fieldErrors.skills && styles.inputErrorBorder]}
                  onPress={() => setIsSkillModalVisible(true)}
                >
                  <Ionicons name="briefcase-outline" size={20} color={Colors.textMuted} />
                  <Text style={[styles.skillText, !skill && styles.skillPlaceholder]}>
                    {skill || t('auth.professionPlaceholder')}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.textPrimary} />
                </Pressable>
                {fieldErrors.skills && <Text style={styles.errorTextObj}>{fieldErrors.skills}</Text>}
              </View>
            )}

            <Button
              title={t('auth.signUp')}
              onPress={handleRegister}
              loading={isLoading}
              size="lg"
              style={{ marginTop: Spacing.sm }}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}> {t('auth.signIn')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Profession Modal */}
      <Modal
        visible={isSkillModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSkillModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsSkillModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('auth.selectProfession')}</Text>
              <Pressable onPress={() => setIsSkillModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />  
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {PROFESSIONS.map((prof) => {
                    const isActive = skill === prof;
                    return (
                        <Pressable
                            key={prof}
                            style={[styles.modalOption, isActive && styles.modalOptionActive]}
                            onPress={() => {
                                setSkill(prof);
                                setFieldErrors(prev => ({ ...prev, skills: '' }));
                                setIsSkillModalVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionText, isActive && styles.modalOptionTextActive]}>
                                {prof}
                            </Text>
                            {isActive && (
                                <Ionicons name="checkmark" size={20} color={Colors.primary} />
                            )}
                        </Pressable>
                    );
                })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  headerContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.hero,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.textMuted,
    marginTop: Spacing.xxs,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  errorBannerText: {
    ...Typography.bodySm,
    color: Colors.error,
    flex: 1,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  roleLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  roleLabelActive: {
    color: Colors.primary,
  },
  roleDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 11,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
  },
  formContainer: {
    marginTop: Spacing.sm,
  },
  skillInputWrapper: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  skillSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputErrorBorder: {
    borderColor: Colors.error,
  },
  skillText: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  skillPlaceholder: {
    color: Colors.textMuted,
  },
  errorTextObj: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    ...Typography.bodySm,
    color: Colors.textMuted,
  },
  footerLink: {
    ...Typography.bodySm,
    color: Colors.primary,
    fontWeight: '600',
  },  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  modalOptionActive: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 0,
  },
  modalOptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  modalOptionTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },});

export default RegisterScreen;
