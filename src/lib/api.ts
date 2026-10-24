const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string; statusCode?: number }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'Request failed',
        statusCode: res.status,
      };
    }

    return {
      success: true,
      data: data.data !== undefined ? data.data : data,
      message: data.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Network error occurred',
    };
  }
}

export const backupApi = {
  getOverview: () => apiRequest('/admin/database/overview'),
  inspect: (data: any, targetCollection?: string) =>
    apiRequest('/admin/database/inspect', {
      method: 'POST',
      body: JSON.stringify({ data, targetCollection }),
    }),
  restore: (params: {
    data: any;
    collections?: string[];
    mode?: 'clean' | 'upsert';
    preserveCurrentAdmin?: boolean;
  }) =>
    apiRequest('/admin/database/restore', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  getHistory: (limit = 20) => apiRequest(`/admin/database/history?limit=${limit}`),
};
