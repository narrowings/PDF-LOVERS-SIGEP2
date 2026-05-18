import axios from 'axios';

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    if (data?.errors) {
      return Object.values(data.errors).flat().join('. ');
    }
    return data?.message ?? err.message ?? 'Error desconocido';
  }
  if (err instanceof Error) return err.message;
  return 'Error desconocido';
}
