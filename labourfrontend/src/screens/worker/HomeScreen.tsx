import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Radii, Typography } from '../../theme';
import { useJobs } from '../../hooks/useJobs';
import { useAuthStore } from '../../store/authStore';
import { WorkerStackParamList, JobFilters, JobType } from '../../types';
import JobCard from '../../components/Card';
import { JobCardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

const JOB_TYPES: { value: JobType | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'daily', label: 'Daily' },
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
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useJobs(filters);

  // Flatten infinite query data into a single array
  const jobs = data?.pages.flatMap((page) => page.data.jobs) || [];

  const handleSearch = useCallback(() => {
    setAppliedSearch(search);
  }, [search]);

  const firstName = user?.name?.split(' ')[0] || t('common.there', 'there');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('workerHome.greeting', { name: firstName })}</Text>
          <Text style={styles.subGreeting}>{t('workerHome.subGreeting')}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
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
            <Pressable
              onPress={() => {
                setSearch('');
                setAppliedSearch('');
              }}
            >
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FlashList
          horizontal
          estimatedItemSize={100}
          showsHorizontalScrollIndicator={false}
          data={JOB_TYPES}
          contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            let labelKey = 'workerHome.all';
            if (item.value === 'full-time') labelKey = 'workerHome.fullTime';
            else if (item.value === 'part-time') labelKey = 'workerHome.partTime';
            else if (item.value === 'contract') labelKey = 'workerHome.contract';
            else if (item.value === 'daily') labelKey = 'workerHome.daily';
            
            return (
              <Pressable
                onPress={() => setActiveFilter(item.value as JobType | '')}
                style={[
                  styles.filterChip,
                  activeFilter === item.value && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === item.value && styles.filterChipTextActive,
                  ]}
                >
                  {t(labelKey)}
                </Text>
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.xs }} />}
        />
      </View>

      {/* Job List */}
      {isLoading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3, 4].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <ErrorState message={t('common.error')} onRetry={refetch} />
      ) : (
        <FlashList
          data={jobs}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
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
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <JobCard
              job={item}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subGreeting: {
    ...Typography.bodySm,
    color: Colors.textMuted,
    marginTop: Spacing.xxs,
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
  },
  filterContainer: {
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  listContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
});

export default HomeScreen;
