import { useCallback, useEffect, useState } from 'react';

export type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  status: number | null;
  refetch: () => void;
};

export function useFetch<T>(url: string): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(url, { signal: controller.signal });

        setStatus(response.status);

        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }

        const result: T = await response.json();
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [url, refetchIndex]);

  const refetch = useCallback(() => {
    setRefetchIndex(i => i + 1);
  }, []);

  return { data, isLoading, error, status, refetch };
}