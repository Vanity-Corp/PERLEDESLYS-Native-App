import { authMock } from '@/mocks/auth.mock';
import { tokenService } from '@/services/token.service';

export const authService = {
  async login(input: { email: string; password: string; remember: boolean }) { const session = await authMock.login(input.email, input.password, input.remember); await tokenService.saveSession(session); return session; },
  async loginWithAccessCode(input: { email: string; accessCode: string; remember: boolean }) { const session = await authMock.loginWithAccessCode(input.email, input.accessCode, input.remember); await tokenService.saveSession(session); return session; },
  async restoreSession() { const session = await tokenService.getSession(); if (!session) return null; if (new Date(session.expiresAt).getTime() < Date.now()) { await tokenService.clearSession(); return null; } return session; },
  async forgotPassword(email: string) { return authMock.forgotPassword(email); },
  async logout() { await tokenService.clearSession(); },
};
