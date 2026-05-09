import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography } from '../theme';
import { getInitials } from '../utils/formatters';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  showBorder?: boolean;
  onPress?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 48,
  showBorder = false,
  onPress,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const fontSize = Math.max(size * 0.35, 14);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (uri) {
      setModalVisible(true);
    }
  };

  return (
    <>
      <Pressable onPress={handlePress} disabled={!onPress && !uri}>
        {uri ? (
          <Image
            source={{ uri }}
            style={[
              styles.image,
              containerStyle,
              showBorder && styles.border,
            ] as any}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <View
            style={[
              styles.fallback,
              containerStyle,
              showBorder && styles.border,
            ]}
          >
            <Text style={[styles.initials, { fontSize }]}>
              {getInitials(name)}
            </Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={Colors.white} />
            </Pressable>
            <Text style={styles.modalTitle}>{name}</Text>
          </View>
          <Image
            source={{ uri: uri || undefined }}
            style={styles.fullImage as any}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: Colors.surfaceLight,
  },
  fallback: {
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  initials: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalTitle: {
    ...Typography.bodyMedium,
    color: Colors.white,
    marginLeft: Spacing.md,
  },
  fullImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default Avatar;
