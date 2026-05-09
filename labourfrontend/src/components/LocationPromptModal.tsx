import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import API from '../services/api/client';
import { Colors } from '../theme';
import Input from './Input';
import Button from './Button';

interface Props {
  visible: boolean;
  onSuccess: () => void;
}

const LocationPromptModal: React.FC<Props> = ({ visible, onSuccess }) => {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!location.trim() || location.trim().length < 2) {
      setError(t('common.validLocation'));
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await API.put('/profile', { location: location.trim() });
      if (response.data?.success && response.data?.data) {
        // Update user context
        setUser(response.data.data);
        onSuccess();
      } else {
        setError(response.data?.message || t('common.locationUpdateFail'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const roleLabel = user.role === 'employer' ? t('auth.workerLabel').toLowerCase() : t('navigation.jobs').toLowerCase();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('common.welcomeBack')}</Text>
          <Text style={styles.subtitle}>
            {t('common.locationPromptSubtitle', { role: roleLabel })}
          </Text>

          <Input
            placeholder="e.g. Mumbai, Maharashtra"
            value={location}
            onChangeText={(text) => {
              setLocation(text);
              if (error) setError('');
            }}
            error={error}
            leftIcon="location-outline"
            containerStyle={{ width: '100%' }}
          />

          <Button
            title={t('common.saveLocation')}
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

export default LocationPromptModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    marginTop: 12,
  },
});
