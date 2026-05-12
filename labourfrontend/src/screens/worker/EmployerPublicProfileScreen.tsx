import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInUp,
} from 'react-native-reanimated';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
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
        <Animated.View entering={FadeInUp.springify()} style={styles.profileHeader}>
          <Avatar
            name={companyName}
            uri={avatar_url}
            size={100}
            showBorder
          />
          <Text style={styles.name}>{companyName}</Text>
          {location && (
            <View style={styles.metaRow}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{location}</Text>
            </View>
          )}
        </Animated.View>

        {/* Company Info */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.infoCard, Shadows.sm]}>
          <View style={styles.infoCardHeader}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="business-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.infoCardTitle}>{t("employerProfile.aboutCompany")}</Text>
          </View>
          
          {description ? (
            <Text style={styles.descText}>{description}</Text>
          ) : (
            <Text style={styles.emptyText}>{t('discover.noDescription')}</Text>
          )}

          <View style={styles.divider} />

          <InfoRow icon="mail-outline" label={t('auth.emailLabel')} value={email || 'Not specified'} />
          <InfoRow icon="call-outline" label={t('profile.phone')} value={phone || 'Not specified'} />
        </Animated.View>
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
    <Ionicons name={icon} size={16} color={Colors.primary} style={{ opacity: 0.7 }} />
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  descText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontWeight: '400',
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 15,
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
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
});

export default EmployerPublicProfileScreen;
