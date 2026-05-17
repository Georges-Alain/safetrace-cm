import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, ActivityIndicator, SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Camera, MapPin, AlertTriangle } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { database, pendingCasesCollection } from '../../db/database';
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
      setErrors({ submit: e.error || "Erreur lors de l'envoi" });
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

        {errors.submit && (
          <Text style={[styles.errorText, { marginHorizontal: spacing.md }]}>
            {errors.submit}
          </Text>
        )}

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
