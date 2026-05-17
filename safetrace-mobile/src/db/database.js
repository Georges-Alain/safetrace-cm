import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'safetrace_pending_cases';

async function readAll() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeAll(cases) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export const pendingCasesCollection = {
  async add(payload) {
    const cases = await readAll();
    const entry = { ...payload, id: `${Date.now()}_${Math.random()}`, synced: false };
    cases.push(entry);
    await writeAll(cases);
    return entry;
  },

  async getPending() {
    const cases = await readAll();
    return cases.filter((c) => !c.synced);
  },

  async markSynced(id) {
    const cases = await readAll();
    await writeAll(cases.map((c) => (c.id === id ? { ...c, synced: true } : c)));
  },
};
