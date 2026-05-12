import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Animated } from 'react-native';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { useMyJobs } from '../../hooks/useJobs';
import { useAuthStore } from '../../store/authStore';
import { EmployerStackParamList } from '../../types';
import { JobCardSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  bgColor: string;
  iconColor: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, bgColor, iconColor, index }) => {
  
  const {} = {};

  return (
    <Animated.View 
      style={[styles.statCard, { backgroundColor: bgColor }, Shadows.md, {}]}
    >
      <View style={[styles.statIconWrap, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[styles.statValue, { color: iconColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<EmployerStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const { data: jobs, isLoading, isError, refetch, isRefetching } = useMyJobs();

  const activeJobs = jobs?.filter((j) => j.is_active) || [];
  const totalApplicants = jobs?.reduce((sum, j) => sum + (j.applicants_count || 0), 0) || 0;
  const firstName = user?.name?.split(' ')[0] || t('common.there', 'there');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <Animated.View style={styles.heroHeader}>
          <View style={[styles.decorHero, styles.dh1]} />
          <View style={[styles.decorHero, styles.dh2]} />
          <View style={styles.heroInner}>
            <View>
              <Text style={styles.heroGreeting}>
                {t('employerDashboard.greeting', { name: firstName })} 👋
              </Text>
              <Text style={styles.heroSub}>{t('employerDashboard.subGreeting')}</Text>
            </View>
            <View style={[styles.heroAvatar, Shadows.sm]}>
              <Text style={styles.heroAvatarText}>{firstName.charAt(0).toUpperCase()}</Text>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ── Stats Row ───────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard
            index={0}
            icon="briefcase"
            value={activeJobs.length}
            label={t('employerDashboard.activeJobs')}
            bgColor={Colors.white}
            iconColor={Colors.primary}
          />
          <StatCard
            index={1}
            icon="people"
            value={totalApplicants}
            label={t('employerDashboard.totalApplicants')}
            bgColor={Colors.white}
            iconColor={Colors.success}
          />
          <StatCard
            index={2}
            icon="document-text"
            value={jobs?.length || 0}
            label={t('employerDashboard.allJobs')}
            bgColor={Colors.white}
            iconColor={Colors.accent}
          />
        </View>

        {/* ── Post Job CTA ──────────────────────────────── */}
        <Animated.View >
          <AnimatedPressable
            onPress={() => navigation.navigate('CreateJob')}
            style={({ pressed }) => [styles.ctaCard, Shadows.glow]}
          >
            <View style={styles.ctaIconWrap}>
              <Ionicons name="add-circle" size={32} color={Colors.white} />
            </View>
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>{t('employerDashboard.postNewJob')}</Text>
              <Text style={styles.ctaDesc}>{t('employerDashboard.postNewJobDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.white} />
          </AnimatedPressable>
        </Animated.View>

        {/* ── Recent Jobs ───────────────────────────────── */}
        <Animated.View >
          <Text style={styles.sectionTitle}>{t('employerDashboard.recentJobs')}</Text>
        </Animated.View>

        {isLoading ? (
          <View style={{ paddingHorizontal: Spacing.xl }}>
            <JobCardSkeleton />
            <JobCardSkeleton />
          </View>
        ) : isError ? (
          <ErrorState message={t('common.error')} onRetry={refetch} />
        ) : activeJobs.length === 0 ? (
          <Animated.View style={styles.emptyJobs}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="briefcase-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyText}>{t('myJobs.noJobs')}</Text>
            <Text style={styles.emptySubtext}>{t('myJobs.noJobsSubtitle')}</Text>
          </Animated.View>
        ) : (
          <View style={styles.jobList}>
            {activeJobs.slice(0, 3).map((job, index) => (
              <AnimatedPressable
                key={job.id}
                onPress={() => navigation.navigate('Applicants', { jobId: job.id, jobTitle: job.title })}
                style={[styles.jobCard, Shadows.sm]}
              >
                <View style={styles.jobStripe} />
                <View style={styles.jobCardInner}>
                  <View style={styles.jobCardLeft}>
                    <Text style={styles.jobCardTitle} numberOfLines={1}>{job.title}</Text>
                    <View style={styles.jobMeta}>
                      <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                      <Text style={styles.jobCardLocation} numberOfLines={1}>{job.location}</Text>
                    </View>
                  </View>
                  <View style={styles.jobCardRight}>
                    <View style={styles.applicantsBadge}>
                      <Ionicons name="people" size={14} color={Colors.primary} />
                      <Text style={styles.applicantsBadgeText}>{job.applicants_count}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </View>
                </View>
              </AnimatedPressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerSafe: {
    backgroundColor: Colors.hero,
    ...Shadows.sm,
    zIndex: 10,
  },
  scroll: {
    paddingBottom: Spacing.xxxl,
  },

  // ── Hero Header ──────────────────────────────
  heroHeader: {
    backgroundColor: Colors.hero,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    overflow: 'hidden',
  },
  decorHero: {
    position: 'absolute',
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dh1: { width: 220, height: 220, top: -110, right: -80 },
  dh2: { width: 140, height: 140, bottom: -40, left: -20, backgroundColor: 'rgba(249,115,22,0.18)' },
  heroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    zIndex: 1,
  },
  heroGreeting: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginTop: 2,
  },
  heroAvatar: {
    width: 52,
    height: 52,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },

  // ── Stats ────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },

  // ── CTA ──────────────────────────────────────
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  ctaIconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { flex: 1 },
  ctaTitle: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '800',
  },
  ctaDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 2,
  },

  // ── Section ───────────────────────────────────
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
    letterSpacing: -0.2,
  },
  jobList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },

  // ── Job Cards ─────────────────────────────────
  jobCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  jobStripe: {
    width: 5,
    backgroundColor: Colors.primary,
  },
  jobCardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  jobCardLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  jobCardTitle: {
    fontSize: 16,
    color: Colors.primaryDeep,
    fontWeight: '700',
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  jobCardLocation: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  jobCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  applicantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  applicantsBadgeText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '800',
  },

  // ── Empty ─────────────────────────────────────
  emptyJobs: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
});

export default DashboardScreen;
