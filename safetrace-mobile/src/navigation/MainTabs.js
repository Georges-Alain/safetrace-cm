import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Map, FileText, User } from 'lucide-react-native';
import { colors } from '../theme';
import HomeScreen from '../screens/home/HomeScreen';
import MapScreen from '../screens/map/MapScreen';
import CasesListScreen from '../screens/cases/CasesListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.text3,
        tabBarIcon: ({ color, size }) => {
          const icons = { Accueil: Home, Carte: Map, Dossiers: FileText, Profil: User };
          const Icon = icons[route.name] ?? Home;
          return <Icon size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Carte" component={MapScreen} />
      <Tab.Screen name="Dossiers" component={CasesListScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
