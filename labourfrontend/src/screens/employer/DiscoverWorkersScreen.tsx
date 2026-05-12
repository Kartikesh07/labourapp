import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Pressable, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import Animated, { 
  FadeInDown, 
  FadeInUp,
} from 'react-native-reanimated';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../theme';
import { useWorkers } from '../../hooks/useWorkers';
import Avatar from '../../components/Avatar';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function DiscoverWorkersScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { workers, isLoading, loadWorkers } = useWorkers();

    const PROFESSIONS = [
        t('discover.anyProfession'),
        t('professions.PLUMBER'),
        t('professions.ELECTRICIAN'),
        t('professions.CARPENTER'),
        t('professions.PAINTER'),
        t('categories.CONSTRUCTION'),
        t('professions.MASON'),
        t('professions.LABOURER'),
        t('categories.OTHER'),
    ];
    
    const [searchSkill, setSearchSkill] = useState(t('discover.anyProfession'));
    const [searchLocation, setSearchLocation] = useState('');
    const [isSkillModalVisible, setIsSkillModalVisible] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        loadWorkers();
    }, [loadWorkers]);

    const handleSearch = (skillOverride?: string, locationOverride?: string) => {
        const skillQuery = skillOverride || searchSkill;
        const locQuery = locationOverride !== undefined ? locationOverride : searchLocation;
        loadWorkers({
            skill: skillQuery === t('discover.anyProfession') ? undefined : skillQuery,
            location: locQuery
        });
    };

    const handleGetCurrentLocation = async () => {
        try {
            setIsLocating(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('common.error'), t('errors.ERR_LOCATION_REQUIRED'));
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const geocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (geocode && geocode.length > 0) {
                const city = geocode[0].city || geocode[0].region || geocode[0].subregion;
                if (city) {
                    setSearchLocation(city);
                    handleSearch(undefined, city);
                } else {
                    Alert.alert(t('common.error'), t('errors.DEFAULT'));
                }
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('errors.DEFAULT'));
            console.error(error);
        } finally {
            setIsLocating(false);
        }
    };

    const handleSelectSkill = (skill: string) => {
        setSearchSkill(skill);
        setIsSkillModalVisible(false);
        handleSearch(skill);
    };

    const renderWorker = ({ item, index }: { item: any, index: number }) => (
        <AnimatedTouchableOpacity
            entering={FadeInDown.delay(index * 100).springify()}
            style={[styles.card, Shadows.sm]}
            onPress={() => navigation.navigate('WorkerPublicProfile', { workerData: item })}
        >
            <View style={styles.cardHeader}>
                <Avatar name={item.name} uri={item.avatar_url} size={64} />
                <View style={styles.cardInfo}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.row}>
                        <Ionicons name="location" size={14} color={Colors.primary} />
                        <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: item.available ? Colors.successLight : Colors.errorLight }]}>
                        <Text style={[styles.statusText, { color: item.available ? Colors.success : Colors.error }]}>
                            {item.available ? t('profile.available') : t('profile.notAvailable')}
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>

            {item.skills && item.skills.length > 0 && (
                <View style={styles.skillsContainer}>
                    {item.skills.map((skill: string, index: number) => (
                        <View key={index} style={styles.skillChip}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                </View>
            )}
        </AnimatedTouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <Animated.View entering={FadeInUp.springify()} style={styles.header}>
                <Text style={styles.title}>{t('navigation.discover')}</Text>
                <Text style={styles.subtitle}>Find and hire top rated workers</Text>
            </Animated.View>

            <View style={styles.searchSection}>
                <Pressable 
                    style={[styles.searchBar, Shadows.sm]} 
                    onPress={() => setIsSkillModalVisible(true)}
                >
                    <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
                    <Text style={[styles.searchInput, { color: searchSkill === t('discover.anyProfession') ? Colors.textMuted : Colors.textPrimary }]}>
                        {searchSkill}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
                </Pressable>

                <View style={[styles.searchBar, Shadows.sm]}>
                    <Ionicons name="location-outline" size={20} color={Colors.primary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('profile.location')}
                        placeholderTextColor={Colors.textMuted}
                        value={searchLocation}
                        onChangeText={setSearchLocation}
                        onSubmitEditing={() => handleSearch()}
                    />
                </View>
                
                <TouchableOpacity 
                    style={styles.currentLocationBtn} 
                    onPress={handleGetCurrentLocation} 
                    disabled={isLocating}
                >
                    {isLocating ? (
                        <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: Spacing.xs }} />
                    ) : (
                        <Ionicons name="locate" size={16} color={Colors.primary} style={{ marginRight: Spacing.xs }} />
                    )}
                    <Text style={styles.currentLocationText}>
                        {isLocating ? t('common.loading') : t('discover.useCurrentLocation')}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={workers}
                keyExtractor={(item) => item.id}
                renderItem={renderWorker}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                      refreshing={isLoading} 
                      onRefresh={handleSearch} 
                      colors={[Colors.primary]}
                      tintColor={Colors.primary}
                    />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>{t('discover.noWorkers')}</Text>
                        </View>
                    ) : null
                }
            />

            {/* Profession / Skill Modal */}
            <Modal
                visible={isSkillModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsSkillModalVisible(false)}
            >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setIsSkillModalVisible(false)}
                >
                  <Animated.View entering={FadeInDown.duration(300)} style={styles.modalContent}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{t('auth.selectProfession')}</Text>
                      <Pressable onPress={() => setIsSkillModalVisible(false)}>
                        <Ionicons name="close" size={24} color={Colors.textPrimary} />  
                      </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {PROFESSIONS.map((prof) => {
                            const isActive = searchSkill === prof;
                            return (
                                <Pressable
                                    key={prof}
                                    style={[styles.modalOption, isActive && styles.modalOptionActive]}
                                    onPress={() => handleSelectSkill(prof)}
                                >
                                    <Text style={[styles.modalOptionText, isActive && styles.modalOptionTextActive]}>
                                        {prof}
                                    </Text>
                                    {isActive && (
                                        <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                                    )}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                  </Animated.View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        marginTop: 2,
        fontWeight: '500',
    },
    searchSection: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.md,
        gap: Spacing.sm,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: Radii.xl,
        paddingHorizontal: Spacing.md,
        height: 52,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.sm,
        color: Colors.textPrimary,
        fontSize: 15,
        fontWeight: '500',
    },
    currentLocationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: Spacing.xxs,
        marginTop: 4,
    },
    currentLocationText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '700',
    },
    list: {
        padding: Spacing.xl,
        paddingTop: Spacing.sm,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: Radii.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    cardInfo: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    metaText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginLeft: 4,
        fontWeight: '500',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: Radii.full,
        marginTop: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    skillChip: {
        backgroundColor: Colors.primaryMuted,
        paddingHorizontal: Spacing.sm,
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
    emptyContainer: {
        alignItems: 'center',
        paddingTop: Spacing.xxxl,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textMuted,
        fontWeight: '600',
        marginTop: Spacing.md,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: Radii.xxl,
        borderTopRightRadius: Radii.xxl,
        padding: Spacing.xl,
        paddingBottom: Spacing.xxxl,
        maxHeight: '80%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: Colors.border,
        borderRadius: Radii.full,
        alignSelf: 'center',
        marginBottom: Spacing.md,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    modalTitle: {
        ...Typography.h2,
        color: Colors.textPrimary,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    modalOptionActive: {
        backgroundColor: Colors.primaryMuted,
        borderRadius: Radii.md,
        borderBottomWidth: 0,
    },
    modalOptionText: {
        ...Typography.bodyMedium,
        color: Colors.textPrimary,
    },
    modalOptionTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
});
