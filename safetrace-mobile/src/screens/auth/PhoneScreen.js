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
