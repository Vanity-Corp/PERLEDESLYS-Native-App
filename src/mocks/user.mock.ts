import type { User } from '@/types/domain';

export const mockUsers: User[] = [
  {
    id: 'user-1', email: 'premium@perledelys.app', name: 'Amira Benali', role: 'premium', hasAccessCode: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&h=320&fit=crop&crop=faces', memberSince: '2025-09-12T09:00:00.000Z',
    preferences: { theme: 'system', notificationsEnabled: true, favoriteCategories: ['soins', 'rituels'] },
  },
  {
    id: 'user-2', email: 'member@perledelys.app', name: 'Lina Moreau', role: 'member', hasAccessCode: false,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&h=320&fit=crop&crop=faces', memberSince: '2026-01-18T09:00:00.000Z',
    preferences: { theme: 'light', notificationsEnabled: false, favoriteCategories: ['guides'] },
  },
];
