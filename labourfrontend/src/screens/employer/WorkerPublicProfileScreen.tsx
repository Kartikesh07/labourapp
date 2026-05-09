import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography } from '../../theme';
import { EmployerStackParamList } from '../../types';
import Avatar from '../../components/Avatar';

type RouteParams = RouteProp<EmployerStackParamList, 'WorkerPublicProfile'>;

const WorkerPublicProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const { workerData } = route.params;

  const profile = workerData;
  const workerProfile = profile?.worker_profiles;
  const name = profile?.name || t('applicants.worker');
  const email = profile?.email;
  const phone = profile?.phone;
  const avatar_url = profile?.avatar_url;
  const skills = workerProfile?.skills || [];
  const experience = workerProfile?.experience;
  const location = workerProfile?.location;
  const bio = workerProfile?.bio;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar
            name={name}
            uri={avatar_url}
            size={100}
            showBorder
          />
          <Text style={styles.name}>{name}</Text>
          {location && (
            <View style={styles.metaRow}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{location}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {phone && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.callButton]} 
              onPress={() => Linking.openURL(`tel:${phone}`)}
            >
              <Ionicons name="call" size={20} color="#FFF" />
              <Text style={styles.actionText}>{t('applicants.contact')}</Text>
            </TouchableOpacity>
          )}
          
          {email && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.emailButton]} 
              onPress={() => Linking.openURL(`mailto:${email}`)}
            >
              <Ionicons name="mail" size={20} color="#FFF" />
              <Text style={styles.actionText}>{t('auth.emailLabel')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Info */}
        <View style={styles.infoCard}>
          <InfoRow icon="mail-outline" label={t('auth.emailLabel')} value={email || t('profile.notAvailable')} />
          <InfoRow icon="call-outline" label={t('profile.phone')} value={phone || t('profile.notAvailable')} />
        </View>

        {/* Professional Details */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoCardTitle}>{t('discover.professionalDetails')}</Text>
          </View>
          
          <InfoRow icon="trophy-outline" label={t('profile.experience')} value={experience || t('profile.notAvailable')} />
          
          {bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioLabel}>{t('profile.about')}</Text>
              <Text style={styles.descText}>{bio}</Text>
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View style={styles.skillsSection}>
              <Text style={styles.bioLabel}>{t("workerProfile.skills")}</Text>
              <View style={styles.skillsRow}>
                {skills.map((skill: string, i: number) => (
                  <View key={i} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    gap: Spacing.xs,
  },
  callButton: {
    backgroundColor: Colors.success,
  },
  emailButton: {
    backgroundColor: Colors.primary,
  },
  actionText: {
    ...Typography.button,
    color: '#FFF',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
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
    width: 90,
  },
  infoValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  bioContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  bioLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  skillsSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  skillChip: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  skillText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default WorkerPublicProfileScreen;
