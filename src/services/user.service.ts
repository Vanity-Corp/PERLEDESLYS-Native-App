import { mockRequest } from '@/mocks/mock-api';
import type { User } from '@/types/domain';

export const userService = {
  updateProfile(user: User, patch: Partial<Pick<User, 'name' | 'avatarUrl' | 'preferences'>>) {
    return mockRequest(() => ({ ...user, ...patch, preferences: { ...user.preferences, ...patch.preferences } }), { allowFailure: false });
  },
};
