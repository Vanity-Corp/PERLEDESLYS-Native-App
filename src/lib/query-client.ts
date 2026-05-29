type QueryOptions<T> = { queryKey: readonly unknown[]; queryFn: () => Promise<T>; staleTime?: number };
const cache = new Map<string, { data: unknown; updatedAt: number }>();
const keyOf = (key: readonly unknown[]) => JSON.stringify(key);

export class QueryClient {
  async fetchQuery<T>({ queryKey, queryFn, staleTime = 1000 * 60 * 5 }: QueryOptions<T>): Promise<T> {
    const key = keyOf(queryKey);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.updatedAt < staleTime) return cached.data as T;
    const data = await queryFn();
    cache.set(key, { data, updatedAt: Date.now() });
    return data;
  }
  invalidateQueries(prefix?: readonly unknown[]) {
    if (!prefix) return cache.clear();
    const value = JSON.stringify(prefix).slice(0, -1);
    for (const key of cache.keys()) if (key.startsWith(value)) cache.delete(key);
  }
}

export const queryClient = new QueryClient();
