import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth.store';
import { usePushNotifications } from '../hooks/usePushNotifications';
import MainTabs from './MainTabs';
import PhoneScreen from '../screens/auth/PhoneScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import NewCaseScreen from '../screens/cases/NewCaseScreen';
import CaseDetailScreen from '../screens/cases/CaseDetailScreen';
import TestimonyScreen from '../screens/testimony/TestimonyScreen';

// createNativeStackNavigator is required for New Architecture compatibility.
// @react-navigation/stack (JS-based) passes gestureEnabled as a string
// through Animated props, which crashes Fabric's JSI type checker.
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { accessToken, restoreSession } = useAuthStore();
  const navigationRef = useRef();

  useEffect(() => { restoreSession(); }, []);

  usePushNotifications(navigationRef);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!accessToken ? (
          <>
            <Stack.Screen name="Phone" component={PhoneScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="NewCase" component={NewCaseScreen} />
            <Stack.Screen name="CaseDetail" component={CaseDetailScreen} />
            <Stack.Screen name="Testimony" component={TestimonyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
