import { mockAccessCodes } from '@/mocks/subscription.mock';
import { mockRequest } from '@/mocks/mock-api';
export const subscriptionService = { validateAccessCode(code: string) { return mockRequest(() => ({ valid: mockAccessCodes.includes(code.trim().toUpperCase()) }), { allowFailure: false }); } };
