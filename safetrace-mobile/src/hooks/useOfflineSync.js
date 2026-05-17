import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { pendingCasesCollection } from '../db/database';
import { casesAPI } from '../api/cases.api';

export function useOfflineSync() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (!state.isConnected) return;
      const pending = await pendingCasesCollection.getPending();
      for (const c of pending) {
        try {
          await casesAPI.create({
            person_name: c.person_name,
            person_age: c.person_age || undefined,
            person_gender: c.person_gender || undefined,
            last_seen_location: c.last_seen_location,
            description: c.description || undefined,
            latitude: c.latitude,
            longitude: c.longitude,
            last_seen_at: c.last_seen_at,
          });
          await pendingCasesCollection.markSynced(c.id);
        } catch (err) {
          console.warn('Sync failed for case:', c.id, err);
        }
      }
    });
    return () => unsubscribe();
  }, []);
}
