import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radii } from '../theme';

const LANGUAGES = [
  { code: 'en', labelKey: 'languages.en' },
  { code: 'hi', labelKey: 'languages.hi' },
  { code: 'mr', labelKey: 'languages.mr' },
  { code: 'kn', labelKey: 'languages.kn' },
] as const;

export const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLangCode = LANGUAGES.find((l) => l.code === i18n.language)?.code || 'en';
  const currentLangLabel = t(`languages.${currentLangCode}` as any);

  const selectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="language-outline" size={24} color={Colors.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.label}>{t('settings.appLanguage')}</Text>
          <Text style={styles.currentVal}>{currentLangLabel}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            {LANGUAGES.map((lang) => {
              const isActive = i18n.language === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  style={[styles.langOption, isActive && styles.langOptionActive]}
                  onPress={() => selectLanguage(lang.code)}
                >
                  <Text
                    style={[
                      styles.langText,
                      isActive && styles.langTextActive,
                    ]}
                  >
                    {t(lang.labelKey as any)}
                  </Text>
                  {isActive && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  label: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  currentVal: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  langOptionActive: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 0,
  },
  langText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  langTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
