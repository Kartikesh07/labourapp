import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../theme';
import AuthStack from './AuthStack';
import WorkerStack from './WorkerTabs';
import EmployerStack from './EmployerTabs';
import LocationPromptModal from '../components/LocationPromptModal';

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, isHydrated, user, hydrate } = useAuthStore();

  const typedUser = user as any;
  const needsLocation = isAuthenticated && user && (!typedUser.location || typedUser.location === 'Not specified' || typedUser.location.trim() === '');
  const [showLocationPrompt, setShowLocationPrompt] = useState(!!needsLocation);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (needsLocation && !isLoading && isHydrated) {
      setShowLocationPrompt(true);
    }
  }, [needsLocation, isLoading, isHydrated]);

  if (isLoading || !isHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        theme={{
        dark: false,
        colors: {
          primary: Colors.primary,
          background: Colors.background,
          card: Colors.surface,
          text: Colors.textPrimary,
          border: Colors.border,
          notification: Colors.accent,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' as const },
          medium: { fontFamily: 'System', fontWeight: '500' as const },
          bold: { fontFamily: 'System', fontWeight: '700' as const },
          heavy: { fontFamily: 'System', fontWeight: '900' as const },
        },
      }}
    >
      {!isAuthenticated ? (
        <AuthStack />
      ) : user?.role === 'employer' ? (
        <EmployerStack />
      ) : (
        <WorkerStack />
      )}
      
      {needsLocation && isAuthenticated && (
        <LocationPromptModal 
          visible={showLocationPrompt} 
          onSuccess={() => setShowLocationPrompt(false)} 
        />
      )}
    </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default RootNavigator;
