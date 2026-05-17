import React from 'react';
import { View, StyleSheet } from 'react-native';
import { User, Check } from 'lucide-react-native';
import { colors } from '../theme';

const PIN_COLORS = {
  ACTIVE:   colors.red,
  INQUIRY:  colors.orange,
  RESOLVED: colors.green,
  PENDING:  colors.text3,
};

export default function MapPin({ status }) {
  const color = PIN_COLORS[status] ?? colors.text3;
  return (
    <View style={[styles.pin, { backgroundColor: color, shadowColor: color }]}>
      {status === 'RESOLVED'
        ? <Check size={10} color="#fff" strokeWidth={3} />
        : <User size={10} color="#fff" />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 24, height: 24,
    borderRadius: 12, borderBottomRightRadius: 2,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.5, shadowRadius: 6, elevation: 4,
  },
});
