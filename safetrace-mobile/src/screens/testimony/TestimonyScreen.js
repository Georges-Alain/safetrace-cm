import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator
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
    if (content.trim().length < 5) { setError('Témoignage trop court (min. 5 caractères)'); return; }
    setLoading(true);
    setError('');
    try {
      await client.post('/testimonies', { case_id: caseId.trim(), content: content.trim() });
      setSuccess(true);
    } catch (e) {
      setError(e.error || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 40, marginBottom: spacing.md }}>✓</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.green, marginBottom: spacing.sm }}>
        Témoignage envoyé
      </Text>
      <Text style={{ fontSize: 13, color: colors.text3, textAlign: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.xl }}>
        Merci pour votre contribution. La famille a été notifiée.
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: colors.orange, borderRadius: radius.lg, padding: spacing.md, paddingHorizontal: spacing.xl }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Retour</Text>
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
            placeholder="ID du dossier partagé"
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
            multiline={true}
          />
        </View>
        {!!error && <Text style={{ color: colors.red, fontSize: 12, marginBottom: spacing.sm }}>{error}</Text>}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Envoyer mon témoignage</Text>
          }
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
  label: {
    fontSize: 10, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 1, color: colors.text3, marginBottom: 5,
  },
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
