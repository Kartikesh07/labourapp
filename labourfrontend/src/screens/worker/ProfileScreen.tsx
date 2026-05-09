import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { useProfile, useUpdateProfile, useUpdateAvailability } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { WorkerProfile } from '../../types';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { ProfileSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import { LanguageSelector } from '../../components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const WorkerProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const { logout, isLoading: logoutLoading } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const availabilityMutation = useUpdateAvailability();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    bio: '',
    experience: '',
    location: '',
    skills: '',
    avatar_base64: '',
    avatar_type: '',
    avatar_uri: '',
  });

  const workerProfile = profile as WorkerProfile | undefined;

  const startEditing = () => {
    setEditData({
      name: workerProfile?.name || '',
      phone: workerProfile?.phone || '',
      bio: workerProfile?.bio || '',
      experience: workerProfile?.experience || '',
      location: workerProfile?.location || '',
      skills: workerProfile?.skills?.join(', ') || '',
      avatar_base64: '',
      avatar_type: '',
      avatar_uri: profile?.avatar_url || '',
    });
    setIsEditing(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setEditData((p) => ({
        ...p,
        avatar_uri: result.assets[0].uri,
        avatar_base64: result.assets[0].base64 as string,
        avatar_type: result.assets[0].mimeType || 'image/jpeg',
      }));
    }
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: editData.name,
        phone: editData.phone,
        bio: editData.bio,
        experience: editData.experience,
        location: editData.location,
        skills: editData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        ...(editData.avatar_base64 && {
          avatar_base64: editData.avatar_base64,
          avatar_type: editData.avatar_type,
        }),
      });
      setIsEditing(false);
      Alert.alert(t('common.welcome'), t('messages.profileUpdated'));
    } catch (err) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const toggleAvailability = async (value: boolean) => {
    try {
      await availabilityMutation.mutateAsync(value);
    } catch (err) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorState message={t('common.error')} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {isEditing ? (
            <Pressable onPress={pickImage} style={styles.avatarEditContainer}>
              <Avatar
                name={profile.name}
                uri={editData.avatar_uri}
                size={90}
                showBorder
                onPress={pickImage}
              />
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={16} color={Colors.white} />
              </View>
            </Pressable>
          ) : (
            <Avatar
              name={profile.name}
              uri={profile.avatar_url}
              size={90}
              showBorder
            />
          )}
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>

          {/* Availability Toggle */}
          <View style={styles.availabilityRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: workerProfile?.available
                    ? Colors.success
                    : Colors.textMuted,
                },
              ]}
            />
            <Text style={styles.availabilityText}>
              {workerProfile?.available ? t('profile.available') : t('profile.notAvailable')}
            </Text>
            <Switch
              value={workerProfile?.available ?? true}
              onValueChange={toggleAvailability}
              trackColor={{ false: Colors.surfaceLight, true: Colors.successLight }}
              thumbColor={
                workerProfile?.available ? Colors.success : Colors.textMuted
              }
            />
          </View>
        </View>

        {isEditing ? (
          /* ─── Edit Mode ─── */
          <View style={styles.editContainer}>
            <Input
              label={t('profile.name')}
              value={editData.name}
              onChangeText={(t) => setEditData((p) => ({ ...p, name: t }))}
              leftIcon="person-outline"
            />
            <Input
              label={t('profile.phone')}
              value={editData.phone}
              onChangeText={(t) => setEditData((p) => ({ ...p, phone: t }))}
              leftIcon="call-outline"
              keyboardType="phone-pad"
            />
            <Input
              label={t('profile.location')}
              value={editData.location}
              onChangeText={(t) => setEditData((p) => ({ ...p, location: t }))}
              leftIcon="location-outline"
            />
            <Input
              label={t('profile.skills')}
              value={editData.skills}
              onChangeText={(t) => setEditData((p) => ({ ...p, skills: t }))}
              leftIcon="construct-outline"
              placeholder={t('profile.skillsPlaceholder')}
            />
            <Input
              label={t('profile.experience')}
              value={editData.experience}
              onChangeText={(t) => setEditData((p) => ({ ...p, experience: t }))}
              leftIcon="trophy-outline"
              placeholder={t('profile.expPlaceholder')}
            />
            <Input
              label={t('profile.bio')}
              value={editData.bio}
              onChangeText={(t) => setEditData((p) => ({ ...p, bio: t }))}
              leftIcon="document-text-outline"
              multiline
              numberOfLines={3}
              placeholder={t('profile.bioPlaceholder')}
            />

            <View style={styles.editActions}>
              <Button
                title={t('common.cancel')}
                onPress={() => setIsEditing(false)}
                variant="ghost"
                fullWidth={false}
                style={{ flex: 1 }}
              />
              <Button
                title={t('common.save')}
                onPress={handleSave}
                loading={updateProfileMutation.isPending}
                fullWidth={false}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        ) : (
          /* ─── View Mode ─── */
          <>
            {/* Info Cards */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="person-outline" size={20} color={Colors.primary} />
                <Text style={styles.infoCardTitle}>{t('profile.about')}</Text>
                <Pressable onPress={startEditing} style={styles.editButton}>
                  <Ionicons name="pencil" size={16} color={Colors.primary} />
                </Pressable>
              </View>
              {workerProfile?.bio && (
                <Text style={styles.bioText}>{workerProfile.bio}</Text>
              )}
              <InfoRow icon="call-outline" label={t('profile.phone')} value={profile.phone} />
              <InfoRow
                icon="location-outline"
                label={t('profile.location')}
                value={workerProfile?.location || t('profile.notAvailable')}
              />
              <InfoRow
                icon="trophy-outline"
                label={t('profile.experience')}
                value={workerProfile?.experience || t('profile.notAvailable')}
              />
            </View>

            {/* Skills */}
            {workerProfile?.skills && workerProfile.skills.length > 0 && (
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Ionicons name="construct-outline" size={20} color={Colors.accent} />
                  <Text style={styles.infoCardTitle}>{t('profile.skills')}</Text>
                </View>
                <View style={styles.skillsRow}>
                  {workerProfile.skills.map((skill, i) => (
                    <View key={i} style={styles.skillChip}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Settings / Language */}
        <View style={{ marginTop: Spacing.xl }}>
          <LanguageSelector />
        </View>

        {/* Logout */}
        <Button
          title={t('common.signOut')}
          onPress={() =>
            Alert.alert(t('common.signOutConfirmTitle'), t('common.signOutConfirmMessage'), [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('common.signOut'), style: 'destructive', onPress: logout },
            ])
          }
          variant="ghost"
          loading={logoutLoading}
          icon={<Ionicons name="log-out-outline" size={20} color={Colors.error} />}
          style={{ marginTop: Spacing.lg }}
        />
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
    <Ionicons name={icon} size={16} color={Colors.textMuted} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  name: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  email: {
    ...Typography.bodySm,
    color: Colors.textMuted,
    marginTop: Spacing.xxs,
  },
  avatarEditContainer: {
    position: 'relative',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    flex: 1,
  },
  editContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoCardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    flex: 1,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    width: 80,
  },
  infoValue: {
    ...Typography.bodySm,
    color: Colors.textPrimary,
    flex: 1,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  skillChip: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs + 2,
    borderRadius: Radii.full,
  },
  skillText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default WorkerProfileScreen;
