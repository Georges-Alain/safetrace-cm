import React, { useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { AlertTriangle, Bell } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';
import { useCasesStore } from '../../store/cases.store';
import FeedCard from '../../components/FeedCard';
import { colors, spacing, radius } from '../../theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const { feedCases, loading, fetchFeed } = useCasesStore();

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const handleRefresh = useCallback(() => { fetchFeed(); }, [fetchFeed]);

  const renderItem = useCallback(
    ({ item }) => (
      <FeedCard
        item={item}
        onPress={() => navigation.navigate('CaseDetail', { caseId: item.id })}
        onTestimonyPress={() =>
          navigation.navigate('Testimony', { caseId: item.id, caseName: item.person_name })
        }
      />
    ),
    [navigation]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Bonjour, <Text style={styles.userName}>{user?.name?.split(' ')[0] || '—'}</Text>
          </Text>
          <Text style={styles.wordmark}>
            Safe<Text style={{ color: colors.orange }}>Trace</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => navigation.navigate('NewCase')}
          >
            <AlertTriangle size={13} color="#fff" />
            <Text style={styles.reportBtnText}>Signaler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifBtn}>
            <Bell size={16} color={colors.text2} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && feedCases.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.orange} size="large" />
        </View>
      ) : (
        <FlatList
          data={feedCases}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={colors.orange}
            />
          }
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>DISPARITIONS EN COURS</Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>Aucune annonce</Text>
              <Text style={styles.emptyText}>
                Pas de disparition signalée pour le moment.{'\n'}
                Soyez le premier à signaler.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('NewCase')}
              >
                <Text style={styles.emptyBtnText}>Signaler une disparition</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: { fontSize: 11, color: colors.text3 },
  userName: { color: colors.text2 },
  wordmark: { fontSize: 20, fontWeight: '800', color: colors.text1, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.orange,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: colors.orange,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  reportBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  notifBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingTop: spacing.md, paddingBottom: 100 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text3,
    letterSpacing: 1.5,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: spacing.xl, alignItems: 'center', marginTop: spacing.xl },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.md },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text1, marginBottom: spacing.sm },
  emptyText: {
    fontSize: 13,
    color: colors.text3,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyBtn: {
    backgroundColor: colors.orange,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
