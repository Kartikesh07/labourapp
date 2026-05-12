import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInUp,
} from 'react-native-reanimated';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { EmployerStackParamList } from '../../types';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';

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
        <Animated.View entering={FadeInUp.springify()} style={styles.profileHeader}>
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
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.actionsContainer}>
          {phone && (
            <Button
              title={t('applicants.contact')}
              onPress={() => Linking.openURL(`tel:${phone}`)}
              icon={<Ionicons name="call" size={18} color={Colors.white} />}
              style={{ flex: 1 }}
              size="lg"
            />
          )}
          
          {email && (
            <Button
              title="Email"
              onPress={() => Linking.openURL(`mailto:${email}`)}
              variant="outline"
              icon={<Ionicons name="mail" size={18} color={Colors.primary} />}
              style={{ flex: 1 }}
              size="lg"
            />
          )}
        </Animated.View>

        {/* Professional Details */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={[styles.infoCard, Shadows.sm]}>
          <View style={styles.infoCardHeader}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="briefcase-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.infoCardTitle}>{t('discover.professionalDetails')}</Text>
          </View>
          
          <InfoRow icon="trophy-outline" label={t('profile.experience')} value={experience || 'Not specified'} />
          <InfoRow icon="call-outline" label={t('profile.phone')} value={phone || 'Not specified'} />
          <InfoRow icon="mail-outline" label="Email" value={email || 'Not specified'} />
          
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
    marginBottom: Spacing.xl,
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
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
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
  bioContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  bioLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
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
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  skillText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default WorkerPublicProfileScreen;
