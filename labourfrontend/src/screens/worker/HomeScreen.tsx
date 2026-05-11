import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
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
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── Header ─────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.greetingBlock}>
              <Text style={styles.greetingLabel}>{t('workerHome.greeting', 'Welcome back,')}</Text>
              <Text style={styles.greetingName}>{firstName}</Text>
            </View>
            <Pressable style={styles.profileBtn}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
              </View>
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('workerHome.searchPlaceholder', 'Search for jobs...')}
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
          </View>

          {/* Filter Chips */}
          <View style={styles.filterContainer}>
            <FlashList
              horizontal
              estimatedItemSize={80}
              showsHorizontalScrollIndicator={false}
              data={JOB_TYPES}
              contentContainerStyle={styles.filterList}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isActive = activeFilter === item.value;
                return (
                  <Pressable
                    onPress={() => setActiveFilter(item.value as JobType | '')}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {t(item.labelKey)}
                    </Text>
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ width: Spacing.xs }} />}
            />
          </View>
        </View>

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
              ListHeaderComponent={<Text style={styles.listTitle}>{t('workerHome.latestJobs', 'Latest Opportunities')}</Text>}
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
                  icon="search-outline"
                  title={t('workerHome.noJobsFound', 'No jobs found')}
                  subtitle={t('workerHome.noJobsSubtitle', 'Try adjusting your search or filters')}
                />
              }
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: {
    flex: 1,
  },
  // ── Header ──────────────────────────────────
  header: {
    backgroundColor: Colors.white,
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  greetingBlock: {
    flex: 1,
  },
  greetingLabel: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
  },
  greetingName: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  profileBtn: {
    padding: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radii.lg,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodySm,
    color: Colors.textPrimary,
    height: '100%',
  },
  filterContainer: {
    marginBottom: Spacing.sm,
  },
  filterList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.white,
  },
  // ── List ────────────────────────────────────
  listContainer: {
    flex: 1,
  },
  listTitle: {
    ...Typography.h3,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    color: Colors.textPrimary,
  },
  listPad: {
    paddingBottom: Spacing.xl,
  },
});

export default HomeScreen;
