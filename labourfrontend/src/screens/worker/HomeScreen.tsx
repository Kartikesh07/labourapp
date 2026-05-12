import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { useJobs } from '../../hooks/useJobs';
import { useAuthStore } from '../../store/authStore';
import { WorkerStackParamList, JobFilters, JobType } from '../../types';
import JobCard from '../../components/Card';
import { JobCardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

const JOB_TYPES: { value: JobType | ''; labelKey: string }[] = [
  { value: '', labelKey: 'workerHome.all' },
  { value: 'full-time', labelKey: 'workerHome.fullTime' },
  { value: 'part-time', labelKey: 'workerHome.partTime' },
  { value: 'contract', labelKey: 'workerHome.contract' },
  { value: 'daily', labelKey: 'workerHome.daily' },
];

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<WorkerStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<JobType | ''>('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const filters: JobFilters = {
    search: appliedSearch || undefined,
    job_type: activeFilter || undefined,
    limit: 20,
  };

  const {
    data, isLoading, isError, refetch, isRefetching,
    hasNextPage, fetchNextPage, isFetchingNextPage,
  } = useJobs(filters);

  const jobs = data?.pages.flatMap((page) => page.data?.jobs ?? []) ?? [];
  const handleSearch = useCallback(() => setAppliedSearch(search), [search]);
  const firstName = user?.name?.split(' ')[0] || t('common.there', 'there');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        {/* ── Header ─────────────────────────────────── */}
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={[styles.avatar, Shadows.sm]}>
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
            </View>

            <View style={styles.greetingBlock}>
              <Text style={styles.greetingLabel}>{t('workerHome.greeting', 'Good day,')}</Text>
              <Text style={styles.greetingName}>{firstName}</Text>
            </View>

            <Pressable style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
              <View style={styles.notifDot} />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Colors.primary} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('workerHome.searchPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={() => { setSearch(''); setAppliedSearch(''); }}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </Pressable>
              )}
            </View>
            <Pressable style={[styles.searchBtn, Shadows.glow]} onPress={handleSearch}>
              <Ionicons name="options-outline" size={22} color={Colors.white} />
            </Pressable>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            <FlashList
              horizontal
              estimatedItemSize={100}
              showsHorizontalScrollIndicator={false}
              data={JOB_TYPES}
              contentContainerStyle={{ paddingHorizontal: Spacing.md }}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isActive = activeFilter === item.value;
                return (
                  <Pressable
                    onPress={() => setActiveFilter(item.value as JobType | '')}
                    style={[styles.chip, isActive && styles.chipActive, isActive && Shadows.glow]}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {t(item.labelKey)}
                    </Text>
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
            />
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* ── Job List ────────────────────────────────── */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.listPad}>
            {[1, 2, 3, 4].map((i) => <JobCardSkeleton key={i} />)}
          </View>
        ) : isError ? (
          <ErrorState message={t('common.error')} onRetry={refetch} />
        ) : (
          <FlashList
            data={jobs}
            refreshControl={
              <RefreshControl 
                refreshing={isRefetching} 
                onRefresh={refetch} 
                colors={[Colors.primary]} 
                tintColor={Colors.primary} 
              />
            }
            onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={{ padding: 16 }}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : null
            }
            estimatedItemSize={150}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPad}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <JobCard
                job={item}
                index={index}
                onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="briefcase-outline"
                title={t('myJobs.noJobs')}
                subtitle={t('workerHome.noJobsSubtitle', 'Try changing your search or filters')}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerSafe: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
    zIndex: 10,
  },
  header: {
    paddingBottom: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radii.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  greetingBlock: {
    flex: 1,
  },
  greetingLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 20,
    color: Colors.primaryDeep,
    fontWeight: '800',
    marginTop: -2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },

  // ── Search ──────────────────────────────────
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  searchBtn: {
    width: 52,
    height: 52,
    borderRadius: Radii.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Filter Chips ────────────────────────────
  filterRow: {
    paddingBottom: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radii.md,
    backgroundColor: Colors.white,
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

  // ── List ────────────────────────────────────
  listContainer: {
    flex: 1,
  },
  listPad: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});

export default HomeScreen;
