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
