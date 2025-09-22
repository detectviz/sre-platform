const getCandidateBases = () => {
  const bases: string[] = [];
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (typeof envBase === 'string' && envBase.trim()) {
    bases.push(envBase.trim().replace(/\/$/, ''));
  }
  bases.push('/api/v1');
  bases.push('http://localhost:8080/api/v1');
  return Array.from(new Set(bases));
};

const buildUrl = (base: string, endpoint: string) => {
  const normalizedBase = base.replace(/\/$/, '');
  const normalizedEndpoint = endpoint.replace(/^\//, '');
  return `${normalizedBase}/${normalizedEndpoint}`;
};

export type FetchJsonOptions = RequestInit & { signal?: AbortSignal };

export const fetchJson = async <T = unknown>(endpoint: string, options: FetchJsonOptions = {}): Promise<T> => {
  const isAbsolute = /^https?:\/\//i.test(endpoint);
  const candidateUrls = isAbsolute
    ? [endpoint]
    : getCandidateBases().map((base) => buildUrl(base, endpoint));

  let lastError: unknown = null;

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Unexpected content-type: ${contentType}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (options.signal?.aborted) {
        throw error;
      }
      if (isAbsolute) {
        break;
      }
    }
  }

  throw lastError ?? new Error('Fetch failed');
};

export default fetchJson;
