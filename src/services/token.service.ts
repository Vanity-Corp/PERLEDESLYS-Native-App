import { secureStore } from '@/lib/secure-store';
import type { AuthSession } from '@/types/domain';

const SESSION_KEY = 'perledelys.session.v1';

export const tokenService = {
  async getSession(): Promise<AuthSession | null> {
    const raw = await secureStore.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as AuthSession; } catch { return null; }
  },
  async saveSession(session: AuthSession) { await secureStore.setItem(SESSION_KEY, JSON.stringify(session)); },
  async clearSession() { await secureStore.deleteItem(SESSION_KEY); },
};
