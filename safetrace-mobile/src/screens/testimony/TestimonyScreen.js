import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Camera } from 'lucide-react-native';
import client from '../../api/client';
import { colors, spacing, radius } from '../../theme';

export default function TestimonyScreen({ route, navigation }) {
  const { caseId, caseName } = route.params ?? {};

  const [content, setContent] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!caseId) { setError('Dossier non identifié'); return; }
    if (content.trim().length < 5) { setError('Témoignage trop court (min. 5 caractères)'); return; }
    setLoading(true);
    setError('');
    try {
      await client.post('/testimonies', {
        case_id: caseId,
        content: content.trim(),
      });
      setSuccess(true);
    } catch (e) {
      setError(e.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <Text style={styles.successIcon}>🫂</Text>
        <Text style={styles.successTitle}>Témoignage envoyé</Text>
        <Text style={styles.successText}>
          Merci pour votre contribution.{'\n'}La famille a été notifiée.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <ChevronLeft size={16} color={colors.text2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Témoignage</Text>
          {caseName && (
            <Text style={styles.sub} numberOfLines={1}>Dossier : {caseName}</Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoEmpty}>
              <Camera size={22} color={colors.text3} />
              <Text style={styles.photoLabel}>Ajouter une photo (optionnel)</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.field}>
          <Text style={styles.label}>Votre témoignage *</Text>
          <TextInput
            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
            placeholder="Décrivez ce que vous avez vu, où et quand..."
            placeholderTextColor={colors.text3}
            value={content}
            onChangeText={setContent}
            multiline={true}
          />
        </View>

        {!!error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

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

        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  successContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successIcon: { fontSize: 56, marginBottom: spacing.md },
  successTitle: { fontSize: 20, fontWeight: '700', color: colors.green, marginBottom: spacing.sm },
  successText: {
    fontSize: 14,
    color: colors.text3,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.text1 },
  sub: { fontSize: 10, color: colors.text3 },
  body: { flex: 1, padding: spacing.md },
  photoBox: {
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.surface3,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  photoEmpty: { padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
  photoLabel: { fontSize: 12, color: colors.text3 },
  photoPreview: { width: '100%', height: 160 },
  field: { marginBottom: spacing.md },
  label: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text3,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.border2,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    color: colors.text1,
    fontSize: 13,
  },
  errorText: { fontSize: 11, color: colors.red, marginBottom: spacing.sm },
  btn: {
    backgroundColor: colors.orange,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.orange,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginTop: spacing.sm,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
