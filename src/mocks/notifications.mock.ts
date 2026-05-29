import type { NotificationItem } from '@/types/domain';
export const mockNotifications: NotificationItem[] = [
  { id: 'n-1', title: 'Nouvelle publication', body: 'Le calendrier d’été privé vient d’être publié.', type: 'publication', read: false, createdAt: '2026-05-26T09:15:00.000Z', contentId: 'c-6' },
  { id: 'n-2', title: 'Recommandé pour vous', body: 'Essayez le rituel éclat rose & or demain matin.', type: 'recommendation', read: false, createdAt: '2026-05-25T18:00:00.000Z', contentId: 'c-1' },
  { id: 'n-3', title: 'Accès activé', body: 'Votre espace premium est prêt.', type: 'access', read: true, createdAt: '2026-05-20T08:00:00.000Z' },
];
