import { ApiError } from '@/utils/api-error';

const NETWORK_LATENCY = { min: 350, max: 950 };
const FAILURE_RATE = 0.04;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => NETWORK_LATENCY.min + Math.random() * (NETWORK_LATENCY.max - NETWORK_LATENCY.min);

export async function mockRequest<T>(handler: () => T | Promise<T>, options: { allowFailure?: boolean; unauthorized?: boolean } = {}) {
  await wait(randomDelay());
  if (options.unauthorized) throw new ApiError('Session expirée. Merci de vous reconnecter.', 'SESSION_EXPIRED', 401);
  if (options.allowFailure !== false && Math.random() < FAILURE_RATE) throw new ApiError('Réseau instable. Réessayez dans quelques instants.', 'NETWORK_ERROR', 503);
  return handler();
}

export function paginate<T>(items: T[], page = 1, pageSize = 6) {
  const start = (page - 1) * pageSize;
  const paginated = items.slice(start, start + pageSize);
  return { items: paginated, page, pageSize, total: items.length, hasNextPage: start + pageSize < items.length };
}
