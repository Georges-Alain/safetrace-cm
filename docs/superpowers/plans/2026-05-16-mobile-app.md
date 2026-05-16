# SafeTrace — Plan 2 : App Mobile React Native

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire l'application mobile React Native (Android prioritaire, iOS) pour les familles et les citoyens — signalement, carte interactive, alertes géolocalisées, et mode hors-ligne.

**Architecture:** React Native avec Expo (managed workflow), navigation par React Navigation, état global via Zustand, persistance offline via WatermelonDB + SQLite, cartes via react-native-maps (OpenStreetMap), notifications push via Expo Notifications + Firebase FCM.

**Tech Stack:** React Native 0.74, Expo SDK 51, React Navigation 6, Zustand, WatermelonDB, Axios, react-native-maps, Expo Notifications, Expo Location, Expo ImagePicker, Expo SecureStore (tokens), React Hook Form + Zod, Lucide React Native (icônes).

**Prérequis :** Plan 1 (Backend API) déployé et accessible. Variables d'environnement API_URL configurée.

---

## Structure des fichiers

```
safetrace-mobile/
├── app.json                        # Config Expo
├── App.js                          # Point d'entrée, providers
├── src/
│   ├── api/
│   │   ├── client.js               # Axios instance + intercepteurs JWT
│   │   ├── auth.api.js             # Appels auth
│   │   ├── cases.api.js            # Appels cases
│   │   └── testimonies.api.js      # Appels témoignages
│   ├── store/
│   │   ├── auth.store.js           # Zustand : user, tokens
│   │   └── cases.store.js          # Zustand : liste locale, sync status
│   ├── db/
│   │   ├── database.js             # Init WatermelonDB
│   │   ├── schema.js               # Schéma tables locales
│   │   └── models/
│   │       └── PendingCase.js      # Modèle case en attente d'envoi
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── PhoneScreen.js      # Saisie numéro tél
│   │   │   └── OTPScreen.js        # Saisie code OTP
│   │   ├── home/
│   │   │   └── HomeScreen.js       # Tableau de bord + alertes
│   │   ├── cases/
│   │   │   ├── NewCaseScreen.js    # Formulaire signalement
│   │   │   ├── CaseDetailScreen.js # Détail dossier
│   │   │   └── CasesListScreen.js  # Liste mes dossiers
│   │   ├── map/
│   │   │   └── MapScreen.js        # Carte interactive
│   │   ├── testimony/
│   │   │   └── TestimonyScreen.js  # Soumettre témoignage
│   │   └── profile/
│   │       └── ProfileScreen.js    # Profil utilisateur
│   ├── navigation/
│   │   ├── AppNavigator.js         # Navigateur racine (auth vs main)
│   │   ├── MainTabs.js             # Bottom tab navigator
│   │   └── CasesStack.js          # Stack navigator cases
│   ├── components/
│   │   ├── CaseCard.js             # Carte d'un dossier
│   │   ├── AlertBanner.js          # Bandeau alerte animé
│   │   ├── MapPin.js               # Marqueur carte custom
│   │   └── LoadingScreen.js        # Écran de chargement
│   ├── hooks/
│   │   ├── useAuth.js              # Hook auth + navigation
│   │   ├── useLocation.js          # Hook géolocalisation
│   │   └── useOfflineSync.js       # Hook sync hors-ligne
│   ├── utils/
│   │   ├── tokens.js               # SecureStore get/set tokens
│   │   └── network.js              # Détection connexion réseau
│   └── theme/
│       └── index.js                # Couleurs, typographie, spacing
├── __tests__/
│   ├── api/client.test.js
│   ├── store/auth.store.test.js
│   └── screens/NewCaseScreen.test.js
└── package.json
```

---

## Task 1 : Initialisation Expo + navigation

**Files:**
- Créer : `safetrace-mobile/` (projet Expo)
- Créer : `src/theme/index.js`
- Créer : `src/navigation/AppNavigator.js`
- Créer : `src/navigation/MainTabs.js`

- [ ] **Étape 1 : Créer le projet Expo**

```bash
npx create-expo-app safetrace-mobile --template blank
cd safetrace-mobile
```

- [ ] **Étape 2 : Installer les dépendances**

```bash
npx expo install react-native-maps expo-location expo-image-picker expo-notifications expo-secure-store expo-network

npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack react-native-screens react-native-safe-area-context react-native-gesture-handler

npm install zustand axios react-hook-form @hookform/resolvers zod

npm install lucide-react-native react-native-svg

npm install @nozbe/watermelondb

npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

- [ ] **Étape 3 : Créer `src/theme/index.js`**

```js
export const colors = {
  bg:        '#080c14',
  surface:   '#0f1623',
  surface2:  '#162031',
  surface3:  '#1c2a3e',
  border:    'rgba(255,255,255,0.07)',
  border2:   'rgba(255,255,255,0.12)',
  orange:    '#f97316',
  orangeDim: 'rgba(249,115,22,0.12)',
  red:       '#ef4444',
  redDim:    'rgba(239,68,68,0.12)',
  green:     '#22c55e',
  text1:     '#f1f5f9',
  text2:     '#94a3b8',
  text3:     '#475569',
};

export const fonts = {
  heading: 'Syne_700Bold',
  headingXL: 'Syne_800ExtraBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};
```

- [ ] **Étape 4 : Créer `src/navigation/MainTabs.js`**

```js
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
          const Icon = icons[route.name];
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
```

- [ ] **Étape 5 : Créer `src/navigation/AppNavigator.js`**

```js
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
```

- [ ] **Étape 6 : Mettre à jour `App.js`**

```js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
```

- [ ] **Étape 7 : Vérifier que l'app démarre**

```bash
npx expo start --android
```
Résultat attendu : app s'ouvre sur l'écran PhoneScreen (fond sombre)

- [ ] **Étape 8 : Commit**

```bash
git add .
git commit -m "feat: initialize Expo app with navigation structure"
```

---

## Task 2 : Client API + store auth

**Files:**
- Créer : `src/api/client.js`
- Créer : `src/api/auth.api.js`
- Créer : `src/store/auth.store.js`
- Créer : `src/utils/tokens.js`
- Créer : `__tests__/store/auth.store.test.js`

- [ ] **Étape 1 : Créer `src/utils/tokens.js`**

```js
import * as SecureStore from 'expo-secure-store';

const KEYS = { access: 'safetrace_access', refresh: 'safetrace_refresh' };

export const tokens = {
  async save(access, refresh) {
    await SecureStore.setItemAsync(KEYS.access, access);
    await SecureStore.setItemAsync(KEYS.refresh, refresh);
  },
  async getAccess() { return SecureStore.getItemAsync(KEYS.access); },
  async getRefresh() { return SecureStore.getItemAsync(KEYS.refresh); },
  async clear() {
    await SecureStore.deleteItemAsync(KEYS.access);
    await SecureStore.deleteItemAsync(KEYS.refresh);
  },
};
```

- [ ] **Étape 2 : Créer `src/api/client.js`**

```js
import axios from 'axios';
import { tokens } from '../utils/tokens';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const client = axios.create({ baseURL: `${API_URL}/api`, timeout: 10000 });

client.interceptors.request.use(async (config) => {
  const token = await tokens.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = await tokens.getRefresh();
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken: refresh });
          await tokens.save(data.accessToken, refresh);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return client(error.config);
        } catch {
          await tokens.clear();
        }
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default client;
```

- [ ] **Étape 3 : Créer `src/api/auth.api.js`**

```js
import client from './client';
import axios from 'axios';

const BASE = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000') + '/api';

export const authAPI = {
  register: (phone, name) =>
    axios.post(`${BASE}/auth/register`, { phone, name }).then((r) => r.data),
  verifyOTP: (phone, otp) =>
    axios.post(`${BASE}/auth/verify-otp`, { phone, otp }).then((r) => r.data),
};
```

- [ ] **Étape 4 : Écrire le test du store auth**

```js
// __tests__/store/auth.store.test.js
import { useAuthStore } from '../../src/store/auth.store';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(() => null),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../../src/api/auth.api', () => ({
  authAPI: {
    verifyOTP: jest.fn(() => Promise.resolve({
      accessToken: 'tok_abc',
      refreshToken: 'ref_xyz',
      user: { id: '1', name: 'Test', role: 'CITIZEN' }
    }))
  }
}));

test('login — stocke les tokens et l\'utilisateur', async () => {
  const { login } = useAuthStore.getState();
  await login('+237612345678', '123456');
  const state = useAuthStore.getState();
  expect(state.accessToken).toBe('tok_abc');
  expect(state.user.name).toBe('Test');
});

test('logout — vide le state', async () => {
  const { logout } = useAuthStore.getState();
  await logout();
  const state = useAuthStore.getState();
  expect(state.accessToken).toBeNull();
  expect(state.user).toBeNull();
});
```

- [ ] **Étape 5 : Lancer le test — vérifier qu'il échoue**

```bash
npx jest __tests__/store/auth.store.test.js
```
Résultat attendu : `FAIL`

- [ ] **Étape 6 : Créer `src/store/auth.store.js`**

```js
import { create } from 'zustand';
import { tokens } from '../utils/tokens';
import { authAPI } from '../api/auth.api';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,

  login: async (phone, otp) => {
    const data = await authAPI.verifyOTP(phone, otp);
    await tokens.save(data.accessToken, data.refreshToken);
    set({ accessToken: data.accessToken, user: data.user });
  },

  logout: async () => {
    await tokens.clear();
    set({ accessToken: null, user: null });
  },

  restoreSession: async () => {
    const token = await tokens.getAccess();
    if (token) set({ accessToken: token });
  },
}));
```

- [ ] **Étape 7 : Lancer le test**

```bash
npx jest __tests__/store/auth.store.test.js
```
Résultat attendu : `PASS`

- [ ] **Étape 8 : Commit**

```bash
git add src/api/ src/store/auth.store.js src/utils/tokens.js __tests__/store/
git commit -m "feat: add API client with JWT refresh and auth store"
```

---

## Task 3 : Écrans d'authentification (Phone + OTP)

**Files:**
- Créer : `src/screens/auth/PhoneScreen.js`
- Créer : `src/screens/auth/OTPScreen.js`

- [ ] **Étape 1 : Créer `src/screens/auth/PhoneScreen.js`**

```js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { Lock } from 'lucide-react-native';
import { authAPI } from '../../api/auth.api';
import { colors, spacing, radius } from '../../theme';

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState('+237');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!/^\+237[0-9]{9}$/.test(phone)) {
      setError('Numéro invalide. Format : +237XXXXXXXXX');
      return;
    }
    if (name.trim().length < 2) {
      setError('Entrez votre nom complet');
      return;
    }
    setLoading(true);
    try {
      await authAPI.register(phone, name.trim());
      navigation.navigate('OTP', { phone });
    } catch (e) {
      setError(e.error || 'Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.logoBox}>
          <Lock size={28} color="#fff" />
        </View>
        <Text style={styles.title}>SafeTrace</Text>
        <Text style={styles.subtitle}>
          Ensemble, retrouvons les personnes{'\n'}disparues au Cameroun
        </Text>

        <Text style={styles.label}>Votre nom complet</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Marie Kamga"
          placeholderTextColor={colors.text3}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Numéro de téléphone</Text>
        <TextInput
          style={styles.input}
          placeholder="+237 6XX XXX XXX"
          placeholderTextColor={colors.text3}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCorrect={false}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Recevoir le code SMS</Text>
          }
        </TouchableOpacity>

        <View style={styles.footer}>
          <Lock size={11} color={colors.text3} />
          <Text style={styles.footerText}>Vérification MTN / Orange Cameroun</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  logoBox: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: colors.orange,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: spacing.lg,
    shadowColor: colors.orange, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  title: {
    fontFamily: 'Syne_800ExtraBold', fontSize: 28,
    color: colors.text1, textAlign: 'center', marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 13, color: colors.text3, textAlign: 'center',
    lineHeight: 20, marginBottom: spacing.xl,
  },
  label: {
    fontSize: 10, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 1, color: colors.text3, marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1.5, borderColor: colors.border2,
    borderRadius: radius.md,
    padding: spacing.md, color: colors.text1,
    fontSize: 15, marginBottom: spacing.md,
  },
  error: { color: colors.red, fontSize: 12, marginBottom: spacing.md },
  btn: {
    backgroundColor: colors.orange, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center',
    shadowColor: colors.orange, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center', marginTop: spacing.lg,
  },
  footerText: { fontSize: 10, color: colors.text3 },
});
```

- [ ] **Étape 2 : Créer `src/screens/auth/OTPScreen.js`**

```js
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing, radius } from '../../theme';

export default function OTPScreen({ route }) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();

  const handleVerify = async () => {
    setError('');
    if (otp.length !== 6) { setError('Code à 6 chiffres requis'); return; }
    setLoading(true);
    try {
      await login(phone, otp);
      // AppNavigator redirige automatiquement vers Main
    } catch (e) {
      setError(e.error || 'Code incorrect ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Code de vérification</Text>
        <Text style={styles.subtitle}>
          Code envoyé au{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="• • • • • •"
          placeholderTextColor={colors.text3}
          textAlign="center"
          autoFocus
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.btn, (loading || otp.length < 6) && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={loading || otp.length < 6}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Vérifier le code</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  title: {
    fontFamily: 'Syne_800ExtraBold', fontSize: 26,
    color: colors.text1, textAlign: 'center', marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 13, color: colors.text3,
    textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl,
  },
  phone: { color: colors.orange, fontWeight: '700' },
  otpInput: {
    backgroundColor: colors.surface2,
    borderWidth: 1.5, borderColor: colors.border2,
    borderRadius: radius.lg,
    padding: spacing.lg,
    fontSize: 28, fontWeight: '700',
    color: colors.text1, letterSpacing: 16,
    marginBottom: spacing.md, textAlign: 'center',
  },
  error: { color: colors.red, fontSize: 12, textAlign: 'center', marginBottom: spacing.md },
  btn: {
    backgroundColor: colors.orange, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
```

- [ ] **Étape 3 : Tester sur simulateur**

```bash
npx expo start --android
```
Vérifier : écran Phone → saisie nom + numéro → SMS OTP → écran OTP → saisie code → navigation vers Home

- [ ] **Étape 4 : Commit**

```bash
git add src/screens/auth/
git commit -m "feat: add phone number and OTP verification screens"
```

---

## Task 4 : HomeScreen + AlertBanner

**Files:**
- Créer : `src/screens/home/HomeScreen.js`
- Créer : `src/components/AlertBanner.js`
- Créer : `src/api/cases.api.js`
- Créer : `src/store/cases.store.js`

- [ ] **Étape 1 : Créer `src/api/cases.api.js`**

```js
import client from './client';

export const casesAPI = {
  list: (params) => client.get('/cases', { params }),
  getById: (id) => client.get(`/cases/${id}`),
  create: (data) => client.post('/cases', data),
  resolve: (id) => client.post(`/cases/${id}/resolve`),
};
```

- [ ] **Étape 2 : Créer `src/store/cases.store.js`**

```js
import { create } from 'zustand';
import { casesAPI } from '../api/cases.api';

export const useCasesStore = create((set, get) => ({
  cases: [],
  nearbyCases: [],
  loading: false,
  error: null,

  fetchNearbyCases: async (lat, lng) => {
    set({ loading: true, error: null });
    try {
      const result = await casesAPI.list({ lat, lng, radiusKm: 50, status: 'ACTIVE', limit: 10 });
      set({ nearbyCases: result.data, loading: false });
    } catch (e) {
      set({ error: e.error || 'Erreur réseau', loading: false });
    }
  },

  fetchMyCases: async () => {
    set({ loading: true });
    try {
      const result = await casesAPI.list({ limit: 50 });
      set({ cases: result.data, loading: false });
    } catch (e) {
      set({ error: e.error || 'Erreur réseau', loading: false });
    }
  },
}));
```

- [ ] **Étape 3 : Créer `src/components/AlertBanner.js`**

```js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors, spacing, radius } from '../theme';

export default function AlertBanner({ count, location }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!count || count === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { opacity: pulse }]} />
      <AlertTriangle size={14} color={colors.red} />
      <View style={styles.text}>
        <Text style={styles.title}>Alerte dans votre zone</Text>
        <Text style={styles.body}>
          {count} disparition{count > 1 ? 's' : ''} active{count > 1 ? 's' : ''} à moins de 50 km
          {location ? ` — ${location}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: radius.md, padding: spacing.sm + 2,
    marginHorizontal: spacing.md, marginTop: spacing.sm,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.red, marginTop: 3,
  },
  title: { fontSize: 11, fontWeight: '600', color: '#f87171', marginBottom: 2 },
  body: { fontSize: 10, color: colors.text2, lineHeight: 15 },
  text: { flex: 1 },
});
```

- [ ] **Étape 4 : Créer `src/components/CaseCard.js`**

```js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, MapPin } from 'lucide-react-native';
import { colors, spacing, radius } from '../theme';

export default function CaseCard({ item, onPress }) {
  const statusColor = {
    ACTIVE: colors.red,
    INQUIRY: colors.orange,
    RESOLVED: colors.green,
    PENDING: colors.text3,
  }[item.status] || colors.text3;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.avatar, { borderColor: statusColor }]}>
        <User size={18} color={colors.text2} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.person_name}{item.person_age ? `, ${item.person_age} ans` : ''}
        </Text>
        <View style={styles.meta}>
          <MapPin size={10} color={colors.text3} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.last_seen_location || '—'}
          </Text>
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
        <Text style={[styles.badgeText, { color: statusColor }]}>
          {item.status === 'ACTIVE' ? 'Actif'
            : item.status === 'INQUIRY' ? 'Enquête'
            : item.status === 'RESOLVED' ? 'Retrouvé'
            : 'En attente'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm + 2,
    marginHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.surface3,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 12, fontWeight: '700', color: colors.text1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 10, color: colors.text3, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: '700' },
});
```

- [ ] **Étape 5 : Créer `src/screens/home/HomeScreen.js`**

```js
import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView
} from 'react-native';
import { AlertTriangle, Eye, Map, FileText, Bell } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';
import { useCasesStore } from '../../store/cases.store';
import AlertBanner from '../../components/AlertBanner';
import CaseCard from '../../components/CaseCard';
import { colors, spacing, radius } from '../../theme';

const TILES = [
  { key: 'report', label: 'Signaler une\ndisparition', Icon: AlertTriangle, primary: true, screen: 'NewCase' },
  { key: 'witness', label: "J'ai vu\nquelqu'un", Icon: Eye, screen: 'Testimony' },
  { key: 'map', label: 'Carte\ninteractive', Icon: Map, screen: 'Carte' },
  { key: 'cases', label: 'Mes\ndossiers', Icon: FileText, screen: 'Dossiers' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const { nearbyCases, fetchNearbyCases } = useCasesStore();

  useEffect(() => { fetchNearbyCases(3.848, 11.502); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, <Text style={styles.name}>{user?.name?.split(' ')[0] || '—'}</Text></Text>
            <Text style={styles.wordmark}>Safe<Text style={{ color: colors.orange }}>Trace</Text></Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Bell size={16} color={colors.text2} />
            {nearbyCases.length > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>

        <AlertBanner
          count={nearbyCases.length}
          location={nearbyCases[0]?.last_seen_location}
        />

        {/* Action tiles */}
        <View style={styles.grid}>
          {TILES.map(({ key, label, Icon, primary, screen }) => (
            <TouchableOpacity
              key={key}
              style={[styles.tile, primary && styles.tilePrimary]}
              onPress={() => navigation.navigate(screen)}
              activeOpacity={0.8}
            >
              <View style={styles.tileIcon}>
                <Icon size={16} color="#fff" />
              </View>
              <Text style={styles.tileLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nearby cases */}
        <Text style={styles.sectionTitle}>CAS RÉCENTS PRÈS DE VOUS</Text>
        {nearbyCases.slice(0, 3).map((c) => (
          <CaseCard
            key={c.id}
            item={c}
            onPress={() => navigation.navigate('CaseDetail', { caseId: c.id })}
          />
        ))}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm,
    backgroundColor: '#0f1d12', borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  greeting: { fontSize: 11, color: colors.text3 },
  name: { color: colors.text2 },
  wordmark: { fontSize: 20, fontWeight: '800', color: colors.text1, marginTop: 2 },
  notifBtn: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.surface3, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 5, right: 5,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: colors.orange, borderWidth: 1.5, borderColor: colors.bg,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    padding: spacing.md,
  },
  tile: {
    width: '47.5%', backgroundColor: colors.surface2,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm,
  },
  tilePrimary: {
    backgroundColor: colors.orange, borderColor: 'transparent',
    shadowColor: colors.orange, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  tileIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  tileLabel: { fontSize: 12, fontWeight: '700', color: colors.text1, lineHeight: 17 },
  sectionTitle: {
    fontSize: 10, fontWeight: '700', color: colors.text3,
    letterSpacing: 1.5, paddingHorizontal: spacing.md,
    marginTop: spacing.sm, marginBottom: spacing.sm,
  },
});
```

- [ ] **Étape 6 : Tester visuellement**

```bash
npx expo start --android
```
Vérifier : HomeScreen affiche les 4 tuiles, le bandeau d'alerte si des cas sont proches, et la liste.

- [ ] **Étape 7 : Commit**

```bash
git add src/screens/home/ src/components/ src/store/cases.store.js src/api/cases.api.js
git commit -m "feat: add home screen with alert banner and case cards"
```

---

## Task 5 : Formulaire de signalement (NewCaseScreen)

**Files:**
- Créer : `src/screens/cases/NewCaseScreen.js`
- Créer : `src/hooks/useLocation.js`
- Créer : `__tests__/screens/NewCaseScreen.test.js`

- [ ] **Étape 1 : Créer `src/hooks/useLocation.js`**

```js
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setError('Permission refusée'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  return { location, error };
}
```

- [ ] **Étape 2 : Écrire le test NewCaseScreen**

```js
// __tests__/screens/NewCaseScreen.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NewCaseScreen from '../../src/screens/cases/NewCaseScreen';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 3.848, longitude: 11.502 } })),
  Accuracy: { Balanced: 3 }
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true })),
  MediaTypeOptions: { Images: 'Images' }
}));

jest.mock('../../src/api/cases.api', () => ({
  casesAPI: { create: jest.fn(() => Promise.resolve({ id: 'new-case-id', status: 'PENDING' })) }
}));

test('affiche le formulaire avec le bouton de soumission', () => {
  const nav = { navigate: jest.fn(), goBack: jest.fn() };
  const { getByText } = render(<NewCaseScreen navigation={nav} />);
  expect(getByText('Envoyer le signalement')).toBeTruthy();
});

test('valide les champs requis avant soumission', async () => {
  const nav = { navigate: jest.fn(), goBack: jest.fn() };
  const { getByText } = render(<NewCaseScreen navigation={nav} />);
  fireEvent.press(getByText('Envoyer le signalement'));
  await waitFor(() => {
    expect(getByText(/nom/i)).toBeTruthy();
  });
});
```

- [ ] **Étape 3 : Lancer le test — vérifier qu'il échoue**

```bash
npx jest __tests__/screens/NewCaseScreen.test.js
```

- [ ] **Étape 4 : Créer `src/screens/cases/NewCaseScreen.js`**

```js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, ActivityIndicator, SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Camera, MapPin, AlertTriangle } from 'lucide-react-native';
import { casesAPI } from '../../api/cases.api';
import { useLocation } from '../../hooks/useLocation';
import { colors, spacing, radius } from '../../theme';

export default function NewCaseScreen({ navigation }) {
  const { location } = useLocation();
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const validate = () => {
    const e = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Nom requis (min. 2 caractères)';
    if (!lastSeen.trim()) e.lastSeen = 'Dernier lieu vu requis';
    if (!location) e.location = 'Géolocalisation indisponible';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await casesAPI.create({
        person_name: name.trim(),
        person_age: age ? parseInt(age) : undefined,
        person_gender: gender || undefined,
        last_seen_location: lastSeen.trim(),
        description: description.trim() || undefined,
        latitude: location.lat,
        longitude: location.lng,
        last_seen_at: new Date().toISOString(),
      });
      navigation.navigate('Dossiers');
    } catch (e) {
      setErrors({ submit: e.error || 'Erreur lors de l\'envoi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <ChevronLeft size={16} color={colors.text2} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Nouveau signalement</Text>
          <Text style={styles.headerSub}>Tous les champs marqués * sont requis</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
          {photo
            ? <Image source={{ uri: photo }} style={styles.photoPreview} />
            : <>
                <Camera size={28} color={colors.text3} />
                <Text style={styles.photoLabel}>Photo de la personne disparue</Text>
                <Text style={styles.photoBtn}>Choisir une photo</Text>
              </>
          }
        </TouchableOpacity>

        <View style={styles.field}>
          <Text style={styles.label}>Nom complet *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Ex: Jean-Pierre Nkomo"
            placeholderTextColor={colors.text3}
            value={name} onChangeText={setName}
            autoCapitalize="words"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Âge</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 28"
              placeholderTextColor={colors.text3}
              value={age} onChangeText={setAge}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Sexe</Text>
            <View style={styles.genderRow}>
              {['M', 'F'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, gender === g && styles.genderActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                    {g === 'M' ? 'Homme' : 'Femme'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Dernier lieu vu *</Text>
          <View style={[styles.inputRow, errors.lastSeen && styles.inputError]}>
            <MapPin size={14} color={colors.text3} />
            <TextInput
              style={styles.inputInner}
              placeholder="Ex: Yaoundé, Mvog-Mbi"
              placeholderTextColor={colors.text3}
              value={lastSeen} onChangeText={setLastSeen}
            />
          </View>
          {errors.lastSeen && <Text style={styles.errorText}>{errors.lastSeen}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description (vêtements, signes particuliers…)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Ex: Portait une chemise bleue et un jean..."
            placeholderTextColor={colors.text3}
            value={description} onChangeText={setDescription}
            multiline
          />
        </View>

        {errors.submit && <Text style={[styles.errorText, { marginHorizontal: spacing.md }]}>{errors.submit}</Text>}

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <AlertTriangle size={16} color="#fff" />
                <Text style={styles.submitText}>Envoyer le signalement</Text>
              </>
          }
        </TouchableOpacity>
        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingTop: spacing.lg,
  },
  back: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: colors.text1 },
  headerSub: { fontSize: 10, color: colors.text3 },
  scroll: { flex: 1, padding: spacing.md },
  photoBox: {
    backgroundColor: colors.surface2, borderWidth: 1.5,
    borderStyle: 'dashed', borderColor: colors.surface3,
    borderRadius: radius.lg, padding: spacing.lg,
    alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md,
  },
  photoPreview: { width: '100%', height: 160, borderRadius: radius.md },
  photoLabel: { fontSize: 12, color: colors.text2, textAlign: 'center' },
  photoBtn: {
    backgroundColor: colors.orange, color: '#fff',
    paddingHorizontal: spacing.md, paddingVertical: 7,
    borderRadius: 9, fontSize: 11, fontWeight: '600', overflow: 'hidden',
  },
  field: { marginBottom: spacing.md },
  label: {
    fontSize: 10, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 1, color: colors.text3, marginBottom: 5,
  },
  input: {
    backgroundColor: colors.surface2, borderWidth: 1.5, borderColor: colors.border2,
    borderRadius: radius.md, padding: spacing.sm + 2,
    color: colors.text1, fontSize: 13,
  },
  inputError: { borderColor: colors.red },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface2, borderWidth: 1.5, borderColor: colors.border2,
    borderRadius: radius.md, paddingHorizontal: spacing.sm + 2,
  },
  inputInner: { flex: 1, padding: spacing.sm + 2, color: colors.text1, fontSize: 13 },
  row: { flexDirection: 'row', gap: spacing.sm },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  genderBtn: {
    flex: 1, padding: spacing.sm, borderRadius: radius.sm,
    backgroundColor: colors.surface2, borderWidth: 1.5, borderColor: colors.border2,
    alignItems: 'center',
  },
  genderActive: { backgroundColor: colors.orangeDim, borderColor: colors.orange },
  genderText: { fontSize: 12, color: colors.text3 },
  genderTextActive: { color: colors.orange, fontWeight: '600' },
  errorText: { fontSize: 11, color: colors.red, marginTop: 4 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.orange, borderRadius: radius.lg,
    padding: spacing.md, marginTop: spacing.sm,
    shadowColor: colors.orange, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
```

- [ ] **Étape 5 : Lancer les tests**

```bash
npx jest __tests__/screens/NewCaseScreen.test.js
```
Résultat attendu : `PASS`

- [ ] **Étape 6 : Commit**

```bash
git add src/screens/cases/NewCaseScreen.js src/hooks/useLocation.js __tests__/screens/
git commit -m "feat: add new case reporting form with validation and geolocation"
```

---

## Task 6 : Carte interactive (MapScreen)

**Files:**
- Créer : `src/screens/map/MapScreen.js`
- Créer : `src/components/MapPin.js`

- [ ] **Étape 1 : Créer `src/components/MapPin.js`**

```js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User, Check } from 'lucide-react-native';
import { colors } from '../theme';

const PIN_COLORS = {
  ACTIVE:   colors.red,
  INQUIRY:  colors.orange,
  RESOLVED: colors.green,
  PENDING:  colors.text3,
};

export default function MapPin({ status }) {
  const color = PIN_COLORS[status] || colors.text3;
  return (
    <View style={[styles.pin, { backgroundColor: color, shadowColor: color }]}>
      {status === 'RESOLVED'
        ? <Check size={10} color="#fff" strokeWidth={3} />
        : <User size={10} color="#fff" />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 24, height: 24,
    borderRadius: 12, borderBottomRightRadius: 2,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.5, shadowRadius: 6, elevation: 4,
  },
});
```

- [ ] **Étape 2 : Créer `src/screens/map/MapScreen.js`**

```js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import MapView, { Marker, UrlTile, Callout } from 'react-native-maps';
import { Filter } from 'lucide-react-native';
import { useCasesStore } from '../../store/cases.store';
import { useLocation } from '../../hooks/useLocation';
import MapPin from '../../components/MapPin';
import { colors, spacing, radius } from '../../theme';

const CAMEROON_REGION = {
  latitude: 5.5,
  longitude: 12.3,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

const STATUS_LABELS = {
  ALL: 'Tous', ACTIVE: 'Actifs', INQUIRY: 'Enquête', RESOLVED: 'Retrouvés'
};

export default function MapScreen({ navigation }) {
  const { nearbyCases, fetchNearbyCases } = useCasesStore();
  const { location } = useLocation();
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const lat = location?.lat || 5.5;
    const lng = location?.lng || 12.3;
    fetchNearbyCases(lat, lng);
  }, [location]);

  const filtered = filter === 'ALL'
    ? nearbyCases
    : nearbyCases.filter((c) => c.status === filter);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Carte</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={12} color={colors.text2} />
          <Text style={styles.filterText}>{STATUS_LABELS[filter]}</Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        initialRegion={CAMEROON_REGION}
        mapType="none"
        showsUserLocation={!!location}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={18}
          shouldReplaceMapContent
        />
        {filtered.map((c) => (
          <Marker
            key={c.id}
            coordinate={{ latitude: c.latitude || 5.5, longitude: c.longitude || 12.3 }}
          >
            <MapPin status={c.status} />
            <Callout onPress={() => navigation.navigate('CaseDetail', { caseId: c.id })}>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>
                  {c.person_name}{c.person_age ? `, ${c.person_age} ans` : ''}
                </Text>
                <Text style={styles.calloutMeta}>{c.last_seen_location}</Text>
                <Text style={styles.calloutAction}>Voir le dossier →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Légende */}
      <View style={styles.legend}>
        {[['ACTIVE', colors.red, 'Disparu'], ['INQUIRY', colors.orange, 'Enquête'], ['RESOLVED', colors.green, 'Retrouvé']].map(([s, c, l]) => (
          <TouchableOpacity
            key={s}
            style={styles.legendItem}
            onPress={() => setFilter(filter === s ? 'ALL' : s)}
          >
            <View style={[styles.legendDot, { backgroundColor: c }]} />
            <Text style={[styles.legendText, filter === s && { color: c }]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingTop: spacing.lg,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.text1 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border2,
    borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6,
  },
  filterText: { fontSize: 11, color: colors.text2, fontWeight: '500' },
  map: { flex: 1 },
  callout: { width: 140, padding: 8 },
  calloutName: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  calloutMeta: { fontSize: 9, color: '#666', marginBottom: 4 },
  calloutAction: { fontSize: 9, color: '#f97316', fontWeight: '600' },
  legend: {
    flexDirection: 'row', gap: spacing.md, alignItems: 'center',
    padding: spacing.sm + 2, paddingHorizontal: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: colors.text3 },
});
```

- [ ] **Étape 3 : Tester visuellement**

```bash
npx expo start --android
```
Vérifier : carte OpenStreetMap du Cameroun visible, épingles colorées cliquables, callout avec nom/lieu.

- [ ] **Étape 4 : Commit**

```bash
git add src/screens/map/ src/components/MapPin.js
git commit -m "feat: add interactive map with OpenStreetMap and case pins"
```

---

## Task 7 : Mode hors-ligne (WatermelonDB)

**Files:**
- Créer : `src/db/database.js`
- Créer : `src/db/schema.js`
- Créer : `src/db/models/PendingCase.js`
- Créer : `src/hooks/useOfflineSync.js`
- Modifier : `src/screens/cases/NewCaseScreen.js`

- [ ] **Étape 1 : Créer `src/db/schema.js`**

```js
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'pending_cases',
      columns: [
        { name: 'person_name', type: 'string' },
        { name: 'person_age', type: 'number', isOptional: true },
        { name: 'person_gender', type: 'string', isOptional: true },
        { name: 'last_seen_location', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'photo_uri', type: 'string', isOptional: true },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'last_seen_at', type: 'string' },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at_local', type: 'number' },
      ],
    }),
  ],
});
```

- [ ] **Étape 2 : Créer `src/db/models/PendingCase.js`**

```js
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class PendingCase extends Model {
  static table = 'pending_cases';

  @field('person_name') personName;
  @field('person_age') personAge;
  @field('person_gender') personGender;
  @field('last_seen_location') lastSeenLocation;
  @field('description') description;
  @field('photo_uri') photoUri;
  @field('latitude') latitude;
  @field('longitude') longitude;
  @field('last_seen_at') lastSeenAt;
  @field('synced') synced;
  @readonly @date('created_at_local') createdAtLocal;
}
```

- [ ] **Étape 3 : Créer `src/db/database.js`**

```js
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import PendingCase from './models/PendingCase';

const adapter = new SQLiteAdapter({ schema, jsi: true });

export const database = new Database({
  adapter,
  modelClasses: [PendingCase],
});

export const pendingCasesCollection = database.get('pending_cases');
```

- [ ] **Étape 4 : Créer `src/hooks/useOfflineSync.js`**

```js
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { pendingCasesCollection, database } from '../db/database';
import { casesAPI } from '../api/cases.api';

export function useOfflineSync() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (!state.isConnected) return;
      const pending = await pendingCasesCollection
        .query()
        .fetch()
        .then((list) => list.filter((c) => !c.synced));

      for (const c of pending) {
        try {
          await casesAPI.create({
            person_name: c.personName,
            person_age: c.personAge,
            person_gender: c.personGender,
            last_seen_location: c.lastSeenLocation,
            description: c.description,
            latitude: c.latitude,
            longitude: c.longitude,
            last_seen_at: c.lastSeenAt,
          });
          await database.write(async () => {
            await c.update((record) => { record.synced = true; });
          });
        } catch (err) {
          console.warn('Sync failed for case:', c.id, err);
        }
      }
    });
    return () => unsubscribe();
  }, []);
}
```

- [ ] **Étape 5 : Modifier `NewCaseScreen.js` — sauvegarder offline si pas de réseau**

```js
// Ajouter en haut de NewCaseScreen.js
import NetInfo from '@react-native-community/netinfo';
import { database, pendingCasesCollection } from '../../db/database';

// Remplacer handleSubmit par :
const handleSubmit = async () => {
  if (!validate()) return;
  setLoading(true);
  const netState = await NetInfo.fetch();
  const payload = {
    person_name: name.trim(),
    person_age: age ? parseInt(age) : undefined,
    person_gender: gender || undefined,
    last_seen_location: lastSeen.trim(),
    description: description.trim() || undefined,
    latitude: location.lat,
    longitude: location.lng,
    last_seen_at: new Date().toISOString(),
  };
  try {
    if (netState.isConnected) {
      await casesAPI.create(payload);
    } else {
      await database.write(async () => {
        await pendingCasesCollection.create((record) => {
          record.personName = payload.person_name;
          record.personAge = payload.person_age || 0;
          record.personGender = payload.person_gender || '';
          record.lastSeenLocation = payload.last_seen_location;
          record.description = payload.description || '';
          record.latitude = payload.latitude;
          record.longitude = payload.longitude;
          record.lastSeenAt = payload.last_seen_at;
          record.synced = false;
        });
      });
    }
    navigation.navigate('Dossiers');
  } catch (e) {
    setErrors({ submit: e.error || 'Erreur lors de l\'envoi' });
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Étape 6 : Ajouter useOfflineSync dans App.js**

```js
// Dans App.js, appeler le hook au niveau racine
import { useOfflineSync } from './src/hooks/useOfflineSync';

function AppContent() {
  useOfflineSync();
  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppContent />
    </GestureHandlerRootView>
  );
}
```

- [ ] **Étape 7 : Tester le mode offline**

Sur simulateur : désactiver le réseau → remplir le formulaire → soumettre → rallumer le réseau → vérifier que le cas apparaît côté backend.

- [ ] **Étape 8 : Commit**

```bash
git add src/db/ src/hooks/useOfflineSync.js
git commit -m "feat: add offline queue with WatermelonDB and auto-sync on reconnect"
```

---

## Task 8 : Notifications push (Expo + Firebase)

**Files:**
- Modifier : `App.js`
- Créer : `src/hooks/usePushNotifications.js`

- [ ] **Étape 1 : Créer `src/hooks/usePushNotifications.js`**

```js
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import client from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications(navigation) {
  const notifListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    (async () => {
      if (!Device.isDevice) return;
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      // Envoyer le token au backend
      await client.patch('/users/me/push-token', { pushToken: token }).catch(() => {});
    })();

    // Notif reçue en foreground
    notifListener.current = Notifications.addNotificationReceivedListener((notif) => {
      console.log('Notification reçue:', notif);
    });

    // Tap sur une notif → ouvrir le dossier
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const caseId = response.notification.request.content.data?.caseId;
      if (caseId && navigation) {
        navigation.navigate('CaseDetail', { caseId });
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notifListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
}
```

- [ ] **Étape 2 : Ajouter une route PATCH /users/me/push-token dans le backend**

Dans `safetrace-api/src/modules/auth/auth.routes.js`, ajouter :

```js
router.patch('/users/me/push-token', requireAuth, async (req, res) => {
  try {
    await db('users').where({ id: req.user.id }).update({ push_token: req.body.pushToken });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
```

- [ ] **Étape 3 : Intégrer dans AppNavigator**

```js
// Dans AppNavigator.js, ajouter :
import { usePushNotifications } from '../hooks/usePushNotifications';

// Dans le composant AppNavigator, avant le return :
const navigationRef = useRef();
usePushNotifications(navigationRef.current);

// Sur NavigationContainer, ajouter ref :
<NavigationContainer ref={navigationRef}>
```

- [ ] **Étape 4 : Tester**

```bash
npx expo start --android
```
Vérifier : demande de permission notifications au premier lancement, token envoyé au backend.

- [ ] **Étape 5 : Commit**

```bash
git add src/hooks/usePushNotifications.js
git commit -m "feat: register push token and handle notification navigation"
```

---

## Task 9 : Screens restants (CaseDetail, CasesList, Testimony, Profile)

**Files:**
- Créer : `src/screens/cases/CaseDetailScreen.js`
- Créer : `src/screens/cases/CasesListScreen.js`
- Créer : `src/screens/testimony/TestimonyScreen.js`
- Créer : `src/screens/profile/ProfileScreen.js`

- [ ] **Étape 1 : Créer `src/screens/cases/CasesListScreen.js`**

```js
import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useCasesStore } from '../../store/cases.store';
import CaseCard from '../../components/CaseCard';
import { colors, spacing } from '../../theme';

export default function CasesListScreen({ navigation }) {
  const { cases, fetchMyCases, loading } = useCasesStore();

  useEffect(() => { fetchMyCases(); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes dossiers</Text>
        <Text style={styles.count}>{cases.length} dossier{cases.length !== 1 ? 's' : ''}</Text>
      </View>
      <FlatList
        data={cases}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <CaseCard item={item} onPress={() => navigation.navigate('CaseDetail', { caseId: item.id })} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? 'Chargement…' : 'Aucun dossier pour le moment.'}
          </Text>
        }
        contentContainerStyle={{ paddingTop: spacing.sm }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, paddingTop: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.text1 },
  count: { fontSize: 12, color: colors.text3 },
  empty: { textAlign: 'center', color: colors.text3, marginTop: 60, fontSize: 13 },
});
```

- [ ] **Étape 2 : Créer `src/screens/cases/CaseDetailScreen.js`**

```js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator
} from 'react-native';
import { ChevronLeft, MapPin, Clock, User } from 'lucide-react-native';
import { casesAPI } from '../../api/cases.api';
import { colors, spacing, radius } from '../../theme';

export default function CaseDetailScreen({ route, navigation }) {
  const { caseId } = route.params;
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    casesAPI.getById(caseId).then((c) => { setCaseData(c); setLoading(false); }).catch(() => setLoading(false));
  }, [caseId]);

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.orange} />
    </View>
  );

  if (!caseData) return null;

  const statusColor = { ACTIVE: colors.red, INQUIRY: colors.orange, RESOLVED: colors.green }[caseData.status] || colors.text3;
  const statusLabel = { ACTIVE: 'Actif', INQUIRY: 'Enquête en cours', RESOLVED: 'Retrouvé', PENDING: 'En attente' }[caseData.status];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <ChevronLeft size={16} color={colors.text2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dossier</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.personHeader}>
          <View style={styles.avatar}>
            <User size={32} color={colors.text2} />
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.name}>{caseData.person_name}</Text>
            {caseData.person_age && <Text style={styles.meta}>{caseData.person_age} ans · {caseData.person_gender === 'M' ? 'Homme' : caseData.person_gender === 'F' ? 'Femme' : '—'}</Text>}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MapPin size={14} color={colors.orange} />
            <Text style={styles.infoLabel}>Dernier lieu vu</Text>
            <Text style={styles.infoValue}>{caseData.last_seen_location || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={14} color={colors.orange} />
            <Text style={styles.infoLabel}>Signalé le</Text>
            <Text style={styles.infoValue}>{new Date(caseData.created_at).toLocaleDateString('fr-FR')}</Text>
          </View>
        </View>

        {caseData.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DESCRIPTION</Text>
            <Text style={styles.description}>{caseData.description}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, paddingTop: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text1, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 7 },
  statusText: { fontSize: 10, fontWeight: '700' },
  body: { padding: spacing.md, gap: spacing.md },
  personHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface2, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 17, fontWeight: '700', color: colors.text1 },
  meta: { fontSize: 12, color: colors.text3, marginTop: 3 },
  personInfo: { flex: 1 },
  infoCard: {
    backgroundColor: colors.surface2, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoLabel: { fontSize: 11, color: colors.text3, flex: 1 },
  infoValue: { fontSize: 12, color: colors.text1, fontWeight: '500' },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 10, fontWeight: '700', color: colors.text3, letterSpacing: 1.5 },
  description: { fontSize: 13, color: colors.text2, lineHeight: 20 },
});
```

- [ ] **Étape 3 : Créer `src/screens/testimony/TestimonyScreen.js`**

```js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, FlatList
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import client from '../../api/client';
import { colors, spacing, radius } from '../../theme';

export default function TestimonyScreen({ navigation }) {
  const [caseId, setCaseId] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!caseId.trim()) { setError('Numéro de dossier requis'); return; }
    if (content.trim().length < 5) { setError('Témoignage trop court'); return; }
    setLoading(true);
    setError('');
    try {
      await client.post('/testimonies', { case_id: caseId.trim(), content: content.trim() });
      setSuccess(true);
    } catch (e) {
      setError(e.error || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 40, marginBottom: spacing.md }}>✓</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.green, marginBottom: spacing.sm }}>Témoignage envoyé</Text>
      <Text style={{ fontSize: 13, color: colors.text3, textAlign: 'center', marginBottom: spacing.xl }}>Merci pour votre contribution. La famille a été notifiée.</Text>
      <TouchableOpacity style={{ backgroundColor: colors.orange, borderRadius: radius.lg, padding: spacing.md, paddingHorizontal: spacing.xl }} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <ChevronLeft size={16} color={colors.text2} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Soumettre un témoignage</Text>
          <Text style={styles.sub}>J'ai vu quelqu'un</Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.field}>
          <Text style={styles.label}>Numéro du dossier *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: ID du dossier partagé"
            placeholderTextColor={colors.text3}
            value={caseId} onChangeText={setCaseId}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Votre témoignage *</Text>
          <TextInput
            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
            placeholder="Décrivez ce que vous avez vu, où et quand..."
            placeholderTextColor={colors.text3}
            value={content} onChangeText={setContent}
            multiline
          />
        </View>
        {!!error && <Text style={{ color: colors.red, fontSize: 12, marginBottom: spacing.sm }}>{error}</Text>}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit} disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Envoyer mon témoignage</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, paddingTop: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.text1 },
  sub: { fontSize: 10, color: colors.text3 },
  body: { flex: 1, padding: spacing.md },
  field: { marginBottom: spacing.md },
  label: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: colors.text3, marginBottom: 5 },
  input: {
    backgroundColor: colors.surface2, borderWidth: 1.5, borderColor: colors.border2,
    borderRadius: radius.md, padding: spacing.sm + 2, color: colors.text1, fontSize: 13,
  },
  btn: {
    backgroundColor: colors.orange, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center',
    shadowColor: colors.orange, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
```

- [ ] **Étape 4 : Créer `src/screens/profile/ProfileScreen.js`**

```js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { User, LogOut, Shield } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing, radius } from '../../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <User size={32} color={colors.text2} />
          </View>
          <View>
            <Text style={styles.name}>{user?.name || '—'}</Text>
            <View style={styles.roleBadge}>
              <Shield size={10} color={colors.orange} />
              <Text style={styles.roleText}>
                {user?.role === 'CITIZEN' ? 'Citoyen' : user?.role === 'FAMILY' ? 'Famille' : user?.role}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={16} color={colors.red} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.md, paddingTop: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 18, fontWeight: '800', color: colors.text1 },
  body: { flex: 1, padding: spacing.md },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface2, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.text1, marginBottom: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  roleText: { fontSize: 11, color: colors.orange, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.redDim, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutText: { color: colors.red, fontWeight: '600', fontSize: 14 },
});
```

- [ ] **Étape 5 : Lancer tous les tests**

```bash
npx jest
```
Résultat attendu : tous PASS

- [ ] **Étape 6 : Commit**

```bash
git add src/screens/
git commit -m "feat: add case detail, cases list, testimony and profile screens"
```

---

## Task 10 : Build Android APK

**Files:**
- Modifier : `app.json`

- [ ] **Étape 1 : Configurer `app.json`**

```json
{
  "expo": {
    "name": "SafeTrace",
    "slug": "safetrace-cm",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": { "backgroundColor": "#080c14" },
    "android": {
      "adaptiveIcon": { "backgroundColor": "#f97316" },
      "package": "cm.safetrace.app",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ]
    },
    "ios": {
      "bundleIdentifier": "cm.safetrace.app",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "SafeTrace utilise votre position pour les alertes de proximité.",
        "NSCameraUsageDescription": "Pour prendre une photo de la personne disparue.",
        "NSPhotoLibraryUsageDescription": "Pour choisir une photo depuis votre galerie."
      }
    },
    "extra": {
      "eas": { "projectId": "your-eas-project-id" }
    }
  }
}
```

- [ ] **Étape 2 : Build APK local (développement)**

```bash
npx expo run:android
```
Résultat attendu : APK généré dans `android/app/build/outputs/apk/debug/`

- [ ] **Étape 3 : Commit final**

```bash
git add app.json
git commit -m "feat: configure Android build for SafeTrace"
```

---

## Vérification finale

```bash
npx jest                  # Tous les tests PASS
npx expo start --android  # App tourne sur simulateur Android
```

**Fonctionnalités à tester manuellement :**
- [ ] Inscription avec numéro +237 → OTP reçu → connexion
- [ ] Signalement d'une disparition avec photo
- [ ] Signalement en mode avion → reconnexion → auto-sync
- [ ] Carte avec épingles cliquables et callout
- [ ] Notification push reçue → tap → ouvre le dossier
- [ ] Témoignage soumis → famille notifiée

---

*Plan 3 (Dashboard Web Police — React + Vite) à créer dans la prochaine session.*
