export type UserRole = 'guest' | 'member' | 'premium';
export type ThemePreference = 'system' | 'light' | 'dark';

export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
  hasAccessCode: boolean;
  memberSince: string;
  preferences: { theme: ThemePreference; notificationsEnabled: boolean; favoriteCategories: string[] };
};

export type AuthSession = { user: User; accessToken: string; refreshToken: string; expiresAt: string; remember: boolean };
export type Category = { id: string; name: string; description: string; icon: string };
export type ContentType = 'article' | 'video' | 'ritual' | 'guide';
export type ContentItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  body: string;
  imageUrl: string;
  categoryId: string;
  type: ContentType;
  durationMinutes: number;
  isPremium: boolean;
  isFeatured: boolean;
  publishedAt: string;
  tags: string[];
  author: string;
  rating: number;
};
export type NotificationItem = { id: string; title: string; body: string; type: 'publication' | 'recommendation' | 'access' | 'reminder'; read: boolean; createdAt: string; contentId?: string };
export type PaginatedResponse<T> = { items: T[]; page: number; pageSize: number; total: number; hasNextPage: boolean };
export type ApiErrorCode = 'NETWORK_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'SESSION_EXPIRED' | 'UNKNOWN';
