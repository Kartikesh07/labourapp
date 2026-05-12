import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInUp,
} from 'react-native-reanimated';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../utils/validators';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useTranslation } from 'react-i18next';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.35;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const handleLogin = async () => {
    clearError();
    setFieldErrors({});
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((e: any) => {
        if (e.path[0]) errors[e.path[0] as string] = e.message;
      });
      setFieldErrors(errors);
      return;
    }
    await login({ email: email.trim().toLowerCase(), password });
  };

  return (
    <View style={styles.root}>
      {/* ── Hero Section ──────────────────────────────── */}
      <View style={styles.hero}>
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
        <View style={[styles.decorCircle, styles.decorCircle3]} />

        <SafeAreaView edges={['top']} style={styles.flex}>
          <Animated.View 
            entering={FadeInUp.delay(200).duration(800).springify()}
            style={styles.heroContent}
          >
            <Animated.View 
              entering={FadeInDown.delay(400).springify()}
              style={[styles.brandMark, Shadows.glow]}
            >
              <Ionicons name="hammer" size={28} color={Colors.white} />
            </Animated.View>
            <View style={styles.brandNameRow}>
              <Text style={styles.brandKaam}>Kaam</Text>
              <Text style={styles.brandReady}>Ready</Text>
            </View>
            <Text style={styles.heroTagline}>
              {t('auth.tagline', 'Find skilled workers. Get hired. Fast.')}
            </Text>
          </Animated.View>
        </SafeAreaView>
      </View>

      {/* ── Form Sheet ───────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <Animated.View
          entering={FadeInDown.delay(300).duration(600).springify().damping(15)}
          style={[styles.formSheet, Shadows.lg]}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <Text style={styles.formTitle}>{t('common.welcome')}</Text>
              <Text style={styles.formSubtitle}>
                {t('auth.signInSubtitle', 'Sign in to your account')}
              </Text>
            </Animated.View>

            {error && (
              <Animated.View 
                entering={FadeInDown.springify()}
                style={styles.errorBanner}
              >
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(600).springify()}>
              <Input
                label={t('auth.emailLabel')}
                placeholder={t('auth.emailPlaceholder')}
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(v) => { setEmail(v); clearError(); }}
                error={fieldErrors.email}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(700).springify()}>
              <Input
                label={t('auth.passwordLabel')}
                placeholder={t('auth.passwordPlaceholder')}
                leftIcon="lock-closed-outline"
                secureTextEntry
                value={password}
                onChangeText={(v) => { setPassword(v); clearError(); }}
                error={fieldErrors.password}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(800).springify()}>
              <Pressable style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  {t('auth.forgotPassword', 'Forgot password?')}
                </Text>
              </Pressable>

              <Button
                title={t('auth.submit')}
                onPress={handleLogin}
                loading={isLoading}
                size="lg"
                style={{ marginTop: Spacing.xs }}
              />

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>{t('common.or', 'or')}</Text>
                <View style={styles.divider} />
              </View>

              <Button
                title={t('auth.signUp', 'Create account')}
                onPress={() => navigation.navigate('Register')}
                variant="outline"
                size="lg"
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {t('auth.noAccount', "Don't have an account?")}
                </Text>
                <Pressable onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}> {t('auth.signUp', 'Join now')}</Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.hero },
  flex: { flex: 1 },

  // ── Hero ────────────────────────────────
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: Colors.hero,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  decorCircle1: { width: 260, height: 260, top: -100, right: -80 },
  decorCircle2: { width: 180, height: 150, top: 40, left: -60 },
  decorCircle3: {
    width: 120,
    height: 120,
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(249, 115, 22, 0.18)',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    paddingBottom: Spacing.xl,
  },
  brandMark: {
    width: 60,
    height: 60,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  brandKaam: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.8,
  },
  brandReady: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.accentLight,
    letterSpacing: -0.8,
  },
  heroTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // ── Form Sheet ──────────────────────────
  formSheet: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    marginTop: -Spacing.xxl,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  formTitle: { ...Typography.h1, color: Colors.textPrimary, marginBottom: Spacing.xxs },
  formSubtitle: { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: Spacing.xl },

  // ── Error ───────────────────────────────
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  errorBannerText: { ...Typography.bodySm, color: Colors.error, flex: 1, fontWeight: '500' },

  // ── Misc ────────────────────────────────
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  forgotPasswordText: { ...Typography.bodySm, color: Colors.primary, fontWeight: '600' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { ...Typography.bodySm, color: Colors.textSecondary },
  footerLink: { ...Typography.bodySm, color: Colors.primary, fontWeight: '700' },
});

export default LoginScreen;
