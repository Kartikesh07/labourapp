import React, { useState, useEffect } from 'react';
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
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { AuthStackParamList, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema } from '../../utils/validators';
import Button from '../../components/Button';
import Input from '../../components/Input';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Animated Role Card ────────────────────────────────────────────────────────
interface RoleCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  isActive: boolean;
  onPress: () => void;
  index: number;
}

const RoleCard: React.FC<RoleCardProps> = ({ icon, label, description, isActive, onPress, index }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.03 : 1, { damping: 12, stiffness: 200 });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(400 + (index * 100)).springify()}
      onPress={onPress}
      style={[
        styles.roleCard, 
        isActive && styles.roleCardActive,
        isActive && Shadows.glow,
        animatedStyle
      ]}
    >
      <View style={[styles.roleIconWrap, isActive && styles.roleIconWrapActive]}>
        <Ionicons name={icon} size={28} color={isActive ? Colors.white : Colors.primary} />
      </View>
      <Text style={[styles.roleLabel, isActive && styles.roleLabelActive]}>{label}</Text>
      <Text style={styles.roleDesc}>{description}</Text>
      {isActive && (
        <View style={styles.roleCheckmark}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
        </View>
      )}
    </AnimatedPressable>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
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
      name, email, phone, password, location,
      role: role || undefined,
      skills: role === 'worker' && skill ? [skill] : undefined,
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
    <View style={styles.root}>
      {/* ── Mini Hero Header ──────────────────────────── */}
      <View style={styles.hero}>
        <View style={[styles.decorCircle, styles.dc1]} />
        <View style={[styles.decorCircle, styles.dc2]} />
        <SafeAreaView edges={['top']}>
          <Animated.View 
            entering={FadeInUp.springify()}
            style={styles.heroContent}
          >
            <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.heroTitle}>{t('auth.registerTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('auth.registerSubtitle')}</Text>
          </Animated.View>
        </SafeAreaView>
      </View>

      {/* ── Form Sheet ──────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <Animated.View 
          entering={FadeInDown.delay(200).springify().damping(15)}
          style={[styles.formSheet, Shadows.lg]}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {error && (
              <Animated.View 
                entering={FadeInDown.springify()}
                style={styles.errorBanner}
              >
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </Animated.View>
            )}

            {/* Role Selection */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Text style={styles.sectionLabel}>{t('auth.roleLabel')}</Text>
              <View style={styles.roleRow}>
                <RoleCard
                  index={0}
                  icon="hammer-outline"
                  label={t('auth.workerLabel')}
                  description={t('auth.workerDesc')}
                  isActive={role === 'worker'}
                  onPress={() => {
                    setRole('worker');
                    setFieldErrors((prev) => ({ ...prev, role: '' }));
                  }}
                />
                <RoleCard
                  index={1}
                  icon="business-outline"
                  label={t('auth.employerLabel')}
                  description={t('auth.employerDesc')}
                  isActive={role === 'employer'}
                  onPress={() => {
                    setRole('employer');
                    setFieldErrors((prev) => ({ ...prev, role: '' }));
                  }}
                />
              </View>
              {fieldErrors.role && <Text style={styles.errorText}>{fieldErrors.role}</Text>}
            </Animated.View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <Animated.View entering={FadeInDown.delay(500).springify()} layout={Layout.springify()}>
                <Input label={t('profile.name')} placeholder={t('auth.namePlaceholder')} leftIcon="person-outline" autoCapitalize="words" value={name} onChangeText={setName} error={fieldErrors.name} />
              </Animated.View>
              
              <Animated.View entering={FadeInDown.delay(600).springify()} layout={Layout.springify()}>
                <Input label={t('auth.emailLabel')} placeholder={t('auth.emailPlaceholder')} leftIcon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} error={fieldErrors.email} />
              </Animated.View>
              
              <Animated.View entering={FadeInDown.delay(700).springify()} layout={Layout.springify()}>
                <Input label={t('auth.phoneLabel')} placeholder="9876543210" leftIcon="call-outline" keyboardType="phone-pad" value={phone} onChangeText={setPhone} error={fieldErrors.phone} />
              </Animated.View>
              
              <Animated.View entering={FadeInDown.delay(800).springify()} layout={Layout.springify()}>
                <Input label={t('auth.passwordLabel')} placeholder={t('auth.passwordHint')} leftIcon="lock-closed-outline" secureTextEntry value={password} onChangeText={setPassword} error={fieldErrors.password} />
              </Animated.View>
              
              <Animated.View entering={FadeInDown.delay(900).springify()} layout={Layout.springify()}>
                <Input label={t('auth.locationLabel')} placeholder="e.g. Mumbai, Maharashtra" leftIcon="location-outline" value={location} onChangeText={setLocation} error={fieldErrors.location} />
              </Animated.View>

              {role === 'worker' && (
                <Animated.View entering={FadeInDown.springify()} style={styles.skillInputWrapper}>
                  <Text style={styles.inputLabel}>{t('auth.professionLabel')}</Text>
                  <Pressable
                    style={[styles.skillSelector, fieldErrors.skills && styles.inputErrorBorder]}
                    onPress={() => setIsSkillModalVisible(true)}
                  >
                    <Ionicons name="briefcase-outline" size={18} color={Colors.textMuted} />
                    <Text style={[styles.skillText, !skill && styles.skillPlaceholder]}>
                      {skill || t('auth.professionPlaceholder')}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={Colors.textPrimary} />
                  </Pressable>
                  {fieldErrors.skills && <Text style={styles.errorTextObj}>{fieldErrors.skills}</Text>}
                </Animated.View>
              )}

              <Animated.View entering={FadeInDown.delay(1000).springify()}>
                <Button title={t('auth.signUp')} onPress={handleRegister} loading={isLoading} size="lg" style={{ marginTop: Spacing.sm }} />
              </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(1100).springify()} style={styles.footer}>
              <Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}> {t('auth.signIn')}</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Profession Modal */}
      <Modal visible={isSkillModalVisible} transparent animationType="slide" onRequestClose={() => setIsSkillModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsSkillModalVisible(false)}>
          <Animated.View entering={FadeInDown.duration(300)} style={styles.modalContent}>
            <View style={styles.modalHandle} />
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
                    onPress={() => { setSkill(prof); setFieldErrors((prev) => ({ ...prev, skills: '' })); setIsSkillModalVisible(false); }}
                  >
                    <Text style={[styles.modalOptionText, isActive && styles.modalOptionTextActive]}>{prof}</Text>
                    {isActive && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.hero },
  flex: { flex: 1 },
  hero: { backgroundColor: Colors.hero, paddingBottom: Spacing.xl, overflow: 'hidden' },
  decorCircle: { position: 'absolute', borderRadius: Radii.full, backgroundColor: 'rgba(255,255,255,0.07)' },
  dc1: { width: 220, height: 220, top: -90, right: -60 },
  dc2: { width: 140, height: 140, top: 20, left: -40 },
  heroContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  backBtn: { width: 42, height: 42, borderRadius: Radii.full, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  heroTitle: { ...Typography.h1, color: Colors.white, fontWeight: '800', fontSize: 28 },
  heroSubtitle: { ...Typography.bodySm, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 15 },
  formSheet: { flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: Radii.xxl, borderTopRightRadius: Radii.xxl, marginTop: -Spacing.xl },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  sectionLabel: { ...Typography.label, color: Colors.textPrimary, marginBottom: Spacing.sm, fontSize: 15 },
  roleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  roleCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radii.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, gap: Spacing.xs, position: 'relative' },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.white, borderWidth: 2 },
  roleIconWrap: { width: 56, height: 56, borderRadius: Radii.lg, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  roleIconWrapActive: { backgroundColor: Colors.primary },
  roleLabel: { ...Typography.bodyMedium, color: Colors.textSecondary, fontWeight: '600' },
  roleLabelActive: { color: Colors.primary, fontWeight: '700' },
  roleDesc: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', fontSize: 11, lineHeight: 14 },
  roleCheckmark: { position: 'absolute', top: 10, right: 10 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.errorLight, padding: Spacing.md, borderRadius: Radii.md, marginBottom: Spacing.md, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.error + '30' },
  errorBannerText: { ...Typography.bodySm, color: Colors.error, flex: 1, fontWeight: '500' },
  errorText: { ...Typography.caption, color: Colors.error, marginTop: -Spacing.xs, marginBottom: Spacing.sm, fontWeight: '600' },
  formContainer: { marginTop: Spacing.sm },
  skillInputWrapper: { marginTop: Spacing.sm, marginBottom: Spacing.lg },
  inputLabel: { ...Typography.label, color: Colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  skillSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radii.md, paddingHorizontal: Spacing.md, height: 52, gap: Spacing.sm },
  inputErrorBorder: { borderColor: Colors.error },
  skillText: { flex: 1, ...Typography.bodyMedium, color: Colors.textPrimary, fontSize: 15 },
  skillPlaceholder: { color: Colors.textMuted },
  errorTextObj: { ...Typography.caption, color: Colors.error, marginTop: Spacing.xxs, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl, paddingBottom: Spacing.md },
  footerText: { ...Typography.bodySm, color: Colors.textMuted },
  footerLink: { ...Typography.bodySm, color: Colors.primary, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: Radii.xxl, borderTopRightRadius: Radii.xxl, padding: Spacing.xl, paddingBottom: Spacing.xxxl, maxHeight: '80%' },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: Radii.full, alignSelf: 'center', marginBottom: Spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { ...Typography.h2, color: Colors.textPrimary },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  modalOptionActive: { backgroundColor: Colors.primaryMuted, borderRadius: Radii.md, borderBottomWidth: 0 },
  modalOptionText: { ...Typography.bodyMedium, color: Colors.textPrimary },
  modalOptionTextActive: { color: Colors.primary, fontWeight: '700' },
});

export default RegisterScreen;
