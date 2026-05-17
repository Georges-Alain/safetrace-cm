import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useCasesStore } from '../../store/cases.store';
import CaseCard from '../../components/CaseCard';
import { colors, spacing } from '../../theme';

export default function CasesListScreen({ navigation }) {
  const { cases, fetchMyCases, loading } = useCasesStore();

  useEffect(() => { fetchMyCases(); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes dossiers</Text>
        <Text style={styles.count}>{cases.length} dossier{cases.length !== 1 ? 's' : ''}</Text>
      </View>
      <FlatList
        data={cases}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <CaseCard item={item} onPress={() => navigation.navigate('CaseDetail', { caseId: item.id })} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? 'Chargement…' : 'Aucun dossier pour le moment.'}
          </Text>
        }
        contentContainerStyle={{ paddingTop: spacing.sm }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, paddingTop: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.text1 },
  count: { fontSize: 12, color: colors.text3 },
  empty: { textAlign: 'center', color: colors.text3, marginTop: 60, fontSize: 13 },
});
