import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography } from '../../theme';
import { WorkerStackParamList } from '../../types';
import Avatar from '../../components/Avatar';

type RouteParams = RouteProp<WorkerStackParamList, 'EmployerPublicProfile'>;

const EmployerPublicProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const { employerData } = route.params;

  const companyName = employerData?.employer_profiles?.company_name || employerData?.name || t('employerProfile.title');
  const description = employerData?.employer_profiles?.description;
  const location = employerData?.employer_profiles?.location;
  const email = employerData?.email;
  const phone = employerData?.phone;
  const avatar_url = employerData?.avatar_url;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar
            name={companyName}
            uri={avatar_url}
            size={100}
            showBorder
            onPress={avatar_url ? undefined : () => {}} // Avatar component will handle fullscreen if uri is present
          />
          <Text style={styles.name}>{companyName}</Text>
          {location && (
            <View style={styles.metaRow}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{location}</Text>
            </View>
          )}
        </View>

        {/* Company Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="business-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoCardTitle}>{t("employerProfile.aboutCompany")}</Text>
          </View>
          
          {description ? (
            <Text style={styles.descText}>{description}</Text>
          ) : (
            <Text style={styles.emptyText}>{t('discover.noDescription')}</Text>
          )}

          <View style={styles.divider} />

          <InfoRow icon="mail-outline" label={t('auth.emailLabel')} value={email || t('profile.notAvailable')} />
          <InfoRow icon="call-outline" label={t('profile.phone')} value={phone || t('profile.notAvailable')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color={Colors.textMuted} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </View>
);

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
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  name: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    marginTop: Spacing.xs,
  },
  metaText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoCardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  descText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    width: 80,
  },
  infoValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
});

export default EmployerPublicProfileScreen;
