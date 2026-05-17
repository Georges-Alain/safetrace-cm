import React, { useState } from 'react';
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
      // AppNavigator auto-redirects to Main when accessToken is set
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
          autoFocus={true}
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
