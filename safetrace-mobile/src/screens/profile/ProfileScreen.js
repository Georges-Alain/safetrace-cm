import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { User, LogOut, Shield } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing, radius } from '../../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <User size={32} color={colors.text2} />
          </View>
          <View>
            <Text style={styles.name}>{user?.name || '—'}</Text>
            <View style={styles.roleBadge}>
              <Shield size={10} color={colors.orange} />
              <Text style={styles.roleText}>
                {user?.role === 'CITIZEN' ? 'Citoyen'
                  : user?.role === 'FAMILY' ? 'Famille'
                  : user?.role === 'OFFICER' ? 'Agent'
                  : user?.role || '—'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={16} color={colors.red} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.md, paddingTop: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 18, fontWeight: '800', color: colors.text1 },
  body: { flex: 1, padding: spacing.md },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface2, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.text1, marginBottom: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  roleText: { fontSize: 11, color: colors.orange, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.redDim, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutText: { color: colors.red, fontWeight: '600', fontSize: 14 },
});
