import { authService } from '@/services/auth.service';
import type { AuthSession, User } from '@/types/domain';

type Listener = () => void;
type AuthState = { session: AuthSession | null; user: User | null; isHydrating: boolean; isAuthenticated: boolean };
let state: AuthState = { session: null, user: null, isHydrating: true, isAuthenticated: false };
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((listener) => listener());
const setState = (patch: Partial<AuthState>) => { state = { ...state, ...patch, isAuthenticated: Boolean(patch.session ?? state.session), user: patch.session?.user ?? patch.user ?? state.user }; emit(); };

export const authStore = {
  getSnapshot: () => state,
  subscribe(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); },
  async hydrate() { setState({ isHydrating: true }); const session = await authService.restoreSession(); setState({ session, user: session?.user ?? null, isHydrating: false, isAuthenticated: Boolean(session) }); },
  async login(input: { email: string; password: string; remember: boolean }) { const session = await authService.login(input); setState({ session, user: session.user, isAuthenticated: true }); return session; },
  async loginWithAccessCode(input: { email: string; accessCode: string; remember: boolean }) { const session = await authService.loginWithAccessCode(input); setState({ session, user: session.user, isAuthenticated: true }); return session; },
  async logout() { await authService.logout(); setState({ session: null, user: null, isAuthenticated: false }); },
  setUser(user: User) { const session = state.session ? { ...state.session, user } : null; setState({ user, session }); },
};
