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
    casesAPI.getById(caseId)
      .then((c) => { setCaseData(c); setLoading(false); })
      .catch(() => setLoading(false));
  }, [caseId]);

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.orange} />
    </View>
  );

  if (!caseData) return null;

  const statusColor = { ACTIVE: colors.red, INQUIRY: colors.orange, RESOLVED: colors.green }[caseData.status] ?? colors.text3;
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
            {caseData.person_age && (
              <Text style={styles.meta}>
                {caseData.person_age} ans · {caseData.person_gender === 'M' ? 'Homme' : caseData.person_gender === 'F' ? 'Femme' : '—'}
              </Text>
            )}
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
