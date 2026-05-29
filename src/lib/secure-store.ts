import { Platform } from 'react-native';

type SecureStoreModule = typeof import('expo-secure-store');
const memory = new Map<string, string>();

async function getSecureStore(): Promise<SecureStoreModule | null> {
  if (Platform.OS === 'web') return null;
  try {
    return await import('expo-secure-store');
  } catch {
    return null;
  }
}

export const secureStore = {
  async getItem(key: string) {
    const store = await getSecureStore();
    if (store) return store.getItemAsync(key);
    return memory.get(key) ?? null;
  },
  async setItem(key: string, value: string) {
    const store = await getSecureStore();
    if (store) return store.setItemAsync(key, value);
    memory.set(key, value);
  },
  async deleteItem(key: string) {
    const store = await getSecureStore();
    if (store) return store.deleteItemAsync(key);
    memory.delete(key);
  },
};
