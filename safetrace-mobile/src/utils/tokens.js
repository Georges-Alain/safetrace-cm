import * as SecureStore from 'expo-secure-store';

const KEYS = { access: 'safetrace_access', refresh: 'safetrace_refresh' };

export const tokens = {
  async save(access, refresh) {
    await SecureStore.setItemAsync(KEYS.access, access);
    await SecureStore.setItemAsync(KEYS.refresh, refresh);
  },
  async getAccess() { return SecureStore.getItemAsync(KEYS.access); },
  async getRefresh() { return SecureStore.getItemAsync(KEYS.refresh); },
  async clear() {
    await SecureStore.deleteItemAsync(KEYS.access);
    await SecureStore.deleteItemAsync(KEYS.refresh);
  },
};
