import { mockAccessCodes } from '@/mocks/subscription.mock';
import { mockUsers } from '@/mocks/user.mock';
import type { AuthSession, User } from '@/types/domain';
import { ApiError } from '@/utils/api-error';
import { mockRequest } from './mock-api';

function makeSession(user: User, remember: boolean): AuthSession {
  const hours = remember ? 24 * 30 : 8;
  return { user, remember, accessToken: `mock-access-${user.id}-${Date.now()}`, refreshToken: `mock-refresh-${user.id}-${Date.now()}`, expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString() };
}

export const authMock = {
  login(email: string, password: string, remember: boolean) {
    return mockRequest(() => {
      const user = mockUsers.find((item) => item.email.toLowerCase() === email.toLowerCase());
      if (!user || password.length < 6) throw new ApiError('Identifiants invalides. Essayez premium@perledelys.app / password.', 'UNAUTHORIZED', 401);
      return makeSession(user, remember);
    }, { allowFailure: false });
  },
  loginWithAccessCode(email: string, code: string, remember: boolean) {
    return mockRequest(() => {
      if (!mockAccessCodes.includes(code.trim().toUpperCase())) throw new ApiError('Code d’accès invalide ou expiré.', 'FORBIDDEN', 403);
      const existing = mockUsers.find((item) => item.email.toLowerCase() === email.toLowerCase());
      const user: User = existing ? { ...existing, role: 'premium', hasAccessCode: true } : { id: `user-${Date.now()}`, email, name: email.split('@')[0] ?? 'Invitée', role: 'premium', hasAccessCode: true, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&h=320&fit=crop&crop=faces', memberSince: new Date().toISOString(), preferences: { theme: 'system', notificationsEnabled: true, favoriteCategories: [] } };
      return makeSession(user, remember);
    }, { allowFailure: false });
  },
  refresh(refreshToken: string) {
    return mockRequest(() => {
      const userId = refreshToken.split('-')[2];
      const user = mockUsers.find((item) => item.id === userId) ?? mockUsers[0];
      return makeSession(user, true);
    }, { allowFailure: false });
  },
  forgotPassword(email: string) { return mockRequest(() => ({ sent: email.includes('@') }), { allowFailure: false }); },
};
