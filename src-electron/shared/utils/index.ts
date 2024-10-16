// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function syncMemoizeWithLimit<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // 删除并重新插入以更新其使用顺序
      const result = cache.get(key)!;
      cache.delete(key);
      cache.set(key, result);
      console.log(`Fetching from cache for args: ${key}`);
      return result;
    }

    console.log(`Computing result for args: ${key}`);
    const result = fn(...args);

    // 若缓存达到限制，移除最早的条目
    if (cache.size >= limit) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, result);

    return result;
  } as T;
}

export function asyncMemoizeWithLimit<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => Promise<any>,
>(fn: T, limit: number): T {
  const cache = new Map<string, Awaited<ReturnType<T>>>();

  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // 删除并重新插入以更新其使用顺序
      const result = cache.get(key)!;
      cache.delete(key);
      cache.set(key, result);
      return result;
    }

    const result = await fn(...args);
    // 若缓存达到限制，移除最早的条目
    if (cache.size >= limit) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, result);

    return result;
  } as T;
}
