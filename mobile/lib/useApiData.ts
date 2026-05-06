import { useEffect, useState } from "react";

export interface ApiDataState<TData> {
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useApiData<TData>(load: () => Promise<TData>, deps: readonly unknown[] = []): ApiDataState<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError(null);

    load()
      .then((result) => {
        if (isMounted) {
          setData(result);
        }
      })
      .catch((cause: unknown) => {
        if (isMounted) {
          setError(cause instanceof Error ? cause : new Error(String(cause)));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [load, revision, ...deps]);

  return {
    data,
    error,
    isLoading,
    refetch: () => setRevision((current) => current + 1),
  };
}
