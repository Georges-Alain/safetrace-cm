import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/auth.store';
import MainTabs from './MainTabs';
import PhoneScreen from '../screens/auth/PhoneScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import NewCaseScreen from '../screens/cases/NewCaseScreen';
import CaseDetailScreen from '../screens/cases/CaseDetailScreen';
import TestimonyScreen from '../screens/testimony/TestimonyScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { accessToken } = useAuthStore();

  return (
    <NavigationContainer>
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
