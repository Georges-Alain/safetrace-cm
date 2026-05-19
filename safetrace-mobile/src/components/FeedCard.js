import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { MapPin, MessageCircle } from 'lucide-react-native';
import { casesAPI } from '../api/cases.api';
import { colors, spacing, radius } from '../theme';

const STATUS_COLOR = {
  ACTIVE: colors.red,
  INQUIRY: colors.orange,
  RESOLVED: colors.green,
};

const STATUS_LABEL = {
  ACTIVE: 'Actif',
  INQUIRY: 'Urgent',
  RESOLVED: 'Retrouvé',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'à l\'instant';
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'hier' : `il y a ${d}j`;
}

export default function FeedCard({ item, onPress, onTestimonyPress }) {
  const [reacted, setReacted] = useState(!!item.user_reacted);
  const [reactCount, setReactCount] = useState(Number(item.reactions_count) || 0);
  const [reactLoading, setReactLoading] = useState(false);

  const handleReact = async () => {
    if (reactLoading) return;
    const prevReacted = reacted;
    const prevCount = reactCount;
    setReacted(!reacted);
    setReactCount((c) => (reacted ? c - 1 : c + 1));
    setReactLoading(true);
    try {
      const result = await casesAPI.react(item.id);
      setReacted(result.reacted);
      setReactCount(result.count);
    } catch {
      setReacted(prevReacted);
      setReactCount(prevCount);
    } finally {
      setReactLoading(false);
    }
  };

  const statusColor = STATUS_COLOR[item.status] ?? colors.text3;
  const testimoniesCount = Number(item.testimonies_count) || 0;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.92}>
        <View style={styles.photoBox}>
          {item.photo_url ? (
            <Image source={{ uri: item.photo_url }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: statusColor + '22' }]}>
              <Text style={styles.initial}>
                {item.person_name?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <View style={[styles.statusBadge, { borderColor: statusColor + '66' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {STATUS_LABEL[item.status] ?? item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.infoBox} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.name} numberOfLines={1}>
          {item.person_name}{item.person_age ? `, ${item.person_age} ans` : ''}
        </Text>
        <View style={styles.metaRow}>
          <MapPin size={11} color={colors.text3} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.last_seen_location || '—'}
          </Text>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.metaText}>{timeAgo(item.created_at)}</Text>
        </View>
        {!!item.description && (
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleReact} disabled={reactLoading}>
          {reactLoading ? (
            <ActivityIndicator size="small" color={colors.orange} />
          ) : (
            <Text style={[styles.hugEmoji, reacted && styles.hugActive]}>🫂</Text>
          )}
          {reactCount > 0 && (
            <Text style={[styles.actionCount, reacted && { color: colors.orange }]}>
              {reactCount}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onTestimonyPress}>
          <MessageCircle size={17} color={testimoniesCount > 0 ? colors.text2 : colors.text3} />
          {testimoniesCount > 0 && (
            <Text style={styles.actionCount}>{testimoniesCount}</Text>
          )}
          <Text style={styles.actionLabel}>Témoigner</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.seeBtn} onPress={onPress}>
          <Text style={styles.seeBtnText}>Voir →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  photoBox: { height: 220, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: 80, fontWeight: '800', color: colors.text1, opacity: 0.18 },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surface + 'cc',
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  infoBox: { padding: spacing.md, paddingBottom: spacing.sm, gap: 4 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: colors.text3 },
  sep: { color: colors.text3, fontSize: 11 },
  desc: { fontSize: 12, color: colors.text2, lineHeight: 18, marginTop: 3 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 6 },
  hugEmoji: { fontSize: 20, opacity: 0.45 },
  hugActive: { opacity: 1 },
  actionCount: { fontSize: 12, color: colors.text3, fontWeight: '600' },
  actionLabel: { fontSize: 12, color: colors.text3 },
  seeBtn: {
    marginLeft: 'auto',
    backgroundColor: colors.orangeDim,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  seeBtnText: { fontSize: 11, fontWeight: '700', color: colors.orange },
});
