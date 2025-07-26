import Spinner from '@/components/ui/Spinner';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { store } from '@/lib/store';
import { selectCurrentSpinner } from '@/lib/store/slice/spinnerSlice';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Provider, useSelector } from 'react-redux';

import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// Prevent the splash screen from auto‐hiding
SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const spinner = useSelector(selectCurrentSpinner);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.safeArea,
        { paddingBottom: insets.bottom - 50 },
      ]}
    >
      {spinner && <Spinner size="large" color="#0000ff" />}

      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
    </SafeAreaView>
  );
};

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
        <StatusBar style="auto" />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stack: {
    flex: 1,
  },
});
