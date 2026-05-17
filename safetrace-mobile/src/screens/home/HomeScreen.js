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
