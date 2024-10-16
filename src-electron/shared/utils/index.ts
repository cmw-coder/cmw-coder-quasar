import { LRUCache } from 'main/components/PromptProcessor/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function syncMemoizeWithLimit<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
): T {
  const cache = new LRUCache<ReturnType<T>>(limit);

  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    const cacheResult = cache.get(key);
    if (cacheResult) {
      return cacheResult;
    }
    const result = fn(...args);
    cache.put(key, result);
    return result;
  } as T;
}

export function asyncMemoizeWithLimit<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => Promise<any>,
>(fn: T, limit: number): T {
  const cache = new LRUCache<ReturnType<T>>(limit);

  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    const key = JSON.stringify(args);
    const cacheResult = cache.get(key);
    if (cacheResult) {
      return cacheResult;
    }

    const result = await fn(...args);
    cache.put(key, result);
    return result;
  } as T;
}
