import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInUp,
} from 'react-native-reanimated';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';
import { EmployerProfile } from '../../types';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { ProfileSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import { LanguageSelector } from '../../components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const EmployerProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const { logout, isLoading: logoutLoading } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    company_name: '',
    description: '',
    location: '',
    avatar_base64: '',
    avatar_type: '',
    avatar_uri: '',
  });

  const employerProfile = profile as EmployerProfile | undefined;

  const startEditing = () => {
    setEditData({
      name: employerProfile?.name || '',
      phone: employerProfile?.phone || '',
      company_name: employerProfile?.company_name || '',
      description: employerProfile?.description || '',
      location: employerProfile?.location || '',
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
        company_name: editData.company_name,
        description: editData.description,
        location: editData.location,
        ...(editData.avatar_base64 && {
          avatar_base64: editData.avatar_base64,
          avatar_type: editData.avatar_type,
        }),
      });
      setIsEditing(false);
      Alert.alert('Success', t('messages.profileUpdated'));
    } catch (err) {
      Alert.alert(t('common.error'), 'Failed to update profile');
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
        <Animated.View entering={FadeInUp.springify()} style={styles.profileHeader}>
          {isEditing ? (
            <Pressable onPress={pickImage} style={styles.avatarEditContainer}>
              <Avatar
                name={employerProfile?.company_name || profile.name}
                uri={editData.avatar_uri}
                size={100}
                showBorder
              />
              <View style={[styles.cameraIconContainer, Shadows.md]}>
                <Ionicons name="camera" size={18} color={Colors.white} />
              </View>
            </Pressable>
          ) : (
            <Avatar
              name={employerProfile?.company_name || profile.name}
              uri={profile.avatar_url}
              size={100}
              showBorder
            />
          )}
          <Text style={styles.name}>{profile.name}</Text>
          {employerProfile?.company_name && (
            <View style={styles.companyRow}>
              <Ionicons name="business" size={16} color={Colors.primary} />
              <Text style={styles.companyName}>{employerProfile.company_name}</Text>
            </View>
          )}
          <Text style={styles.email}>{profile.email}</Text>
        </Animated.View>

        {isEditing ? (
          /* ─── Edit Mode ─── */
          <Animated.View entering={FadeInDown.springify()} style={[styles.editContainer, Shadows.md]}>
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
              label={t('profile.companyInfo')}
              value={editData.company_name}
              onChangeText={(t) => setEditData((p) => ({ ...p, company_name: t }))}
              leftIcon="business-outline"
            />
            <Input
              label={t('profile.location')}
              value={editData.location}
              onChangeText={(t) => setEditData((p) => ({ ...p, location: t }))}
              leftIcon="location-outline"
            />
            <Input
              label={t('profile.bio')}
              value={editData.description}
              onChangeText={(t) => setEditData((p) => ({ ...p, description: t }))}
              leftIcon="document-text-outline"
              multiline
              numberOfLines={3}
              placeholder={t('profile.bioPlaceholder')}
            />

            <View style={styles.editActions}>
              <Button
                title={t('common.cancel')}
                onPress={() => setIsEditing(false)}
                variant="secondary"
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
          </Animated.View>
        ) : (
          /* ─── View Mode ─── */
          <>
            <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.infoCard, Shadows.sm]}>
              <View style={styles.infoCardHeader}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="business-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.infoCardTitle}>{t('profile.companyInfo')}</Text>
                <Pressable onPress={startEditing} style={[styles.editButton, Shadows.sm]}>
                  <Ionicons name="pencil" size={14} color={Colors.white} />
                </Pressable>
              </View>
              {employerProfile?.description ? (
                <Text style={styles.descText}>{employerProfile.description}</Text>
              ) : (
                <Text style={[styles.descText, { color: Colors.textMuted, fontStyle: 'italic' }]}>
                  No description provided. Tap edit to add one.
                </Text>
              )}
              
              <View style={styles.divider} />
              
              <InfoRow icon="call-outline" label={t('profile.phone')} value={profile.phone} />
              <InfoRow
                icon="location-outline"
                label={t('profile.location')}
                value={employerProfile?.location || 'Not specified'}
              />
            </Animated.View>
          </>
        )}

        {/* Settings / Language */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: Spacing.md }}>
          <LanguageSelector />
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
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
            style={{ marginTop: Spacing.xl, marginBottom: Spacing.xxl }}
          />
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
    paddingBottom: Spacing.xxxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    letterSpacing: -0.5,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    marginTop: 4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  email: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  avatarEditContainer: {
    position: 'relative',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Colors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  editContainer: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
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
    flex: 1,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: Radii.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontWeight: '400',
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
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    width: 85,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
});

export default EmployerProfileScreen;
