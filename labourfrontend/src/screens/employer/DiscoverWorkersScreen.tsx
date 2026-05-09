import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Pressable, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Colors, Spacing, Radii, Typography } from '../../theme';
import { useWorkers } from '../../hooks/useWorkers';
import Avatar from '../../components/Avatar';

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

    const renderWorker = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('WorkerPublicProfile', { workerData: item })}
        >
            <View style={styles.cardHeader}>
                <Avatar name={item.name} uri={item.avatar_url} size={60} />
                <View style={styles.cardInfo}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.row}>
                        <Ionicons name="location" size={14} color={Colors.primary} />
                        <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: item.available ? Colors.success + '20' : Colors.error + '20' }]}>
                        <Text style={[styles.statusText, { color: item.available ? Colors.success : Colors.error }]}>
                            {item.available ? t('profile.available') : t('profile.notAvailable')}
                        </Text>
                    </View>
                </View>
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
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('navigation.discover')}</Text>
            </View>

            <View style={styles.searchSection}>
                <Pressable 
                    style={styles.searchBar} 
                    onPress={() => setIsSkillModalVisible(true)}
                >
                    <Ionicons name="briefcase-outline" size={20} color={Colors.textMuted} />
                    <Text style={[styles.searchInput, { color: searchSkill === t('discover.anyProfession') ? Colors.textMuted : Colors.textPrimary }]}>
                        {searchSkill}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
                </Pressable>

                <View style={styles.searchBar}>
                    <Ionicons name="location" size={20} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('profile.location')}
                        placeholderTextColor={Colors.textMuted}
                        value={searchLocation}
                        onChangeText={setSearchLocation}
                        onSubmitEditing={() => handleSearch()}
                    />
                </View>
                
                {/* Current Location Action Button */}
                <TouchableOpacity 
                    style={styles.currentLocationBtn} 
                    onPress={handleGetCurrentLocation} 
                    disabled={isLocating}
                    activeOpacity={0.7}
                >
                    {isLocating ? (
                        <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: Spacing.sm }} />
                    ) : (
                        <Ionicons name="locate" size={18} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
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
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={handleSearch} />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
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
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.title}>{t('auth.selectProfession')}</Text>
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
                                        <Ionicons name="checkmark" size={20} color={Colors.primary} />
                                    )}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                  </View>
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
        ...Typography.h1,
        color: Colors.textPrimary,
    },
    searchSection: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.md,
        gap: Spacing.sm,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: Radii.lg,
        paddingHorizontal: Spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.sm,
        color: Colors.textPrimary,
        ...Typography.bodyMedium,
    },
    currentLocationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.xs,
        marginTop: Spacing.xxs,
    },
    currentLocationText: {
        ...Typography.bodyMedium,
        color: Colors.primary,
        fontWeight: '600',
    },
    list: {
        padding: Spacing.xl,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Radii.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
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
        ...Typography.h3,
        color: Colors.textPrimary,
        marginBottom: Spacing.xxs,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xxs,
    },
    metaText: {
        ...Typography.bodySm,
        color: Colors.textSecondary,
        marginLeft: Spacing.xxs,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xxs,
        borderRadius: Radii.full,
        marginTop: Spacing.xxs,
    },
    statusText: {
        ...Typography.label,
        fontWeight: '600',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    skillChip: {
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xxs,
        borderRadius: Radii.full,
    },
    skillText: {
        ...Typography.label,
        color: Colors.primary,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: Spacing.xxxl,
    },
    emptyText: {
        ...Typography.bodyMedium,
        color: Colors.textMuted,
        marginTop: Spacing.md,
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
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    modalOptionActive: {
        backgroundColor: Colors.primaryLight + '20',
        borderRadius: Radii.sm,
        paddingHorizontal: Spacing.sm,
        borderBottomWidth: 0,
    },
    modalOptionText: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    modalOptionTextActive: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
});
