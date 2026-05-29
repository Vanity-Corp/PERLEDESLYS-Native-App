import { mockNotifications } from '@/mocks/notifications.mock';
import { mockRequest, paginate } from '@/mocks/mock-api';

export const notificationsService = {
  getNotifications(page = 1) { return mockRequest(() => paginate(mockNotifications, page, 10), { allowFailure: false }); },
  registerForPush() { return mockRequest(() => ({ token: `ExponentPushToken[mock-${Date.now()}]`, status: 'granted' as const }), { allowFailure: false }); },
};
