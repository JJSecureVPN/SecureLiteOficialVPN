import { useEffect, useState, useCallback, useRef } from 'react';

export type NoticiaItem = {
  id: number | string;
  titulo: string;
  descripcion?: string;
  contenido_completo?: string;
  imagen_url?: string;
  imagen_alt?: string;
  fecha_publicacion?: string;
  categoria_nombre?: string;
  categoria_color?: string;
};

export type NoticiasHookConfig = {
  limit?: number;
  pollInterval?: number;
  apiUrl?: string;
  apiKey?: string;
  enablePolling?: boolean;
};

export type NoticiasHookReturn = {
  items: NoticiaItem[];
  loading: boolean;
  error: string | null;
  fetchedAt: string | null;
  reload: () => Promise<void>;
  isRefreshing: boolean;
};

const DEFAULT_CONFIG: Required<NoticiasHookConfig> = {
  limit: 10,
  pollInterval: 60_000,
  apiUrl: '',
  apiKey: '',
  enablePolling: true,
};

export function useNoticias(config: NoticiasHookConfig = {}): NoticiasHookReturn {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<NoticiaItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const cancelledRef = useRef(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          page: '1',
          limit: String(finalConfig.limit),
        });

        const baseUrl =
          finalConfig.apiUrl || (import.meta as any).env?.VITE_NEWS_API_URL || '/api/noticias/vpn';

        const url = `${baseUrl}?${params.toString()}`;

        const headers: Record<string, string> = {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        };

        if (finalConfig.apiKey) {
          headers['x-vpn-api-key'] = finalConfig.apiKey;
        }

        const response = await fetch(url, {
          cache: 'no-store',
          headers,
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          console.warn('[useNoticias] Non-OK response:', response.status, text.slice(0, 500));
          throw new Error(`Error ${response.status}: No se pudieron cargar las noticias`);
        }

        const contentType = response.headers.get('content-type')?.toLowerCase() || '';
        if (!contentType.includes('application/json')) {
          const text = await response.text().catch(() => '');
          console.warn('[useNoticias] Invalid content-type:', contentType, text.slice(0, 500));
          throw new Error('El servidor retornó una respuesta inválida');
        }

        const json = await response.json();

        if (!json.success) {
          throw new Error(json.error || 'Error al obtener noticias');
        }

        const newsData = (json.data || []) as NoticiaItem[];

        if (cancelledRef.current) return;

        setItems(newsData);
        setFetchedAt(new Date().toISOString());
        setError(null);
      } catch (err: any) {
        if (cancelledRef.current) return;

        let errorMessage = 'Error al cargar noticias';

        if (err.name === 'AbortError' || err.name === 'TimeoutError') {
          errorMessage = 'La conexión tardó demasiado tiempo';
        } else if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
          errorMessage = 'No se pudo conectar con el servidor';
        } else if (typeof err.message === 'string') {
          // Filter out raw HTML/XML responses
          if (!err.message.includes('<') && !err.message.includes('DOCTYPE')) {
            errorMessage = err.message;
          }
        }

        console.error('[useNoticias] Error fetching news:', err);
        setError(errorMessage);
      } finally {
        if (!cancelledRef.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [finalConfig.limit, finalConfig.apiUrl, finalConfig.apiKey],
  );

  const reload = useCallback(async () => {
    await fetchNews(true);
  }, [fetchNews]);

  useEffect(() => {
    cancelledRef.current = false;

    // Initial fetch
    fetchNews(false);

    // Set up polling if enabled
    if (finalConfig.enablePolling && finalConfig.pollInterval > 0) {
      pollIntervalRef.current = setInterval(() => {
        fetchNews(false);
      }, finalConfig.pollInterval);
    }

    return () => {
      cancelledRef.current = true;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [fetchNews, finalConfig.enablePolling, finalConfig.pollInterval]);

  return {
    items,
    loading,
    error,
    fetchedAt,
    reload,
    isRefreshing,
  };
}
