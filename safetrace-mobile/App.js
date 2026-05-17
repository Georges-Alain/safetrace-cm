import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { useOfflineSync } from './src/hooks/useOfflineSync';
import AppNavigator from './src/navigation/AppNavigator';

// Catch any unhandled native errors and print full stack for debugging
if (__DEV__) {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error(`[GlobalError] ${isFatal ? 'FATAL' : 'non-fatal'}: ${error.message}\n${error.stack}`);
    originalHandler(error, isFatal);
  });
}

function AppContent() {
  useOfflineSync();
  return <AppNavigator />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Syne_700Bold,
    Syne_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppContent />
    </GestureHandlerRootView>
  );
}
