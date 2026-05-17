import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { pendingCasesCollection, database } from '../db/database';
import { casesAPI } from '../api/cases.api';

export function useOfflineSync() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (!state.isConnected) return;
      const pending = await pendingCasesCollection
        .query()
        .fetch()
        .then((list) => list.filter((c) => !c.synced));

      for (const c of pending) {
        try {
          await casesAPI.create({
            person_name: c.personName,
            person_age: c.personAge || undefined,
            person_gender: c.personGender || undefined,
            last_seen_location: c.lastSeenLocation,
            description: c.description || undefined,
            latitude: c.latitude,
            longitude: c.longitude,
            last_seen_at: c.lastSeenAt,
          });
          await database.write(async () => {
            await c.update((record) => { record.synced = true; });
          });
        } catch (err) {
          console.warn('Sync failed for case:', c.id, err);
        }
      }
    });
    return () => unsubscribe();
  }, []);
}
