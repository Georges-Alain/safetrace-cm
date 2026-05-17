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
