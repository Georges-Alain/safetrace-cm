import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors, spacing, radius } from '../theme';

export default function AlertBanner({ count, location }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!count || count === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { opacity: pulse }]} />
      <AlertTriangle size={14} color={colors.red} />
      <View style={styles.text}>
        <Text style={styles.title}>Alerte dans votre zone</Text>
        <Text style={styles.body}>
          {count} disparition{count > 1 ? 's' : ''} active{count > 1 ? 's' : ''} à moins de 50 km
          {location ? ` — ${location}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: radius.md, padding: spacing.sm + 2,
    marginHorizontal: spacing.md, marginTop: spacing.sm,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.red, marginTop: 3,
  },
  title: { fontSize: 11, fontWeight: '600', color: '#f87171', marginBottom: 2 },
  body: { fontSize: 10, color: colors.text2, lineHeight: 15 },
  text: { flex: 1 },
});
