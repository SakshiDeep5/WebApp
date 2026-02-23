const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<{ data?: T; error?: { message: string; errors?: unknown } }> {
  const { token: tokenOpt, ...fetchOpts } = options;
  const token = tokenOpt !== undefined ? tokenOpt : getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOpts.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...fetchOpts, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      error: {
        message: json.message || 'Request failed',
        errors: json.errors,
      },
    };
  }
  return { data: json as T };
}

// Auth
export type LoginRes = { token: string; user: User };
export type RegisterRes = { token: string; user: User };
export function login(body: { email: string; password: string }) {
  return api<LoginRes>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) });
}
export function register(body: { name: string; email: string; password: string }) {
  return api<RegisterRes>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

// Profile
export type User = { _id: string; name: string; email: string };
export type ProfileRes = { user: User };
export function getProfile(token: string | null) {
  return api<ProfileRes>('/api/profile', { token });
}
export function updateProfile(body: { name?: string; email?: string }) {
  return api<ProfileRes>('/api/profile', { method: 'PUT', body: JSON.stringify(body) });
}

// Tasks
export type Task = { _id: string; title: string; description?: string; status: TaskStatus; userId: string; createdAt: string };
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TasksRes = { tasks: Task[] };
export type TaskRes = { task: Task };
export function getTasks(params?: { search?: string; status?: string }) {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.status) q.set('status', params.status);
  const query = q.toString();
  return api<TasksRes>(`/api/tasks${query ? `?${query}` : ''}`);
}
export function createTask(body: { title: string; description?: string; status?: TaskStatus }) {
  return api<TaskRes>('/api/tasks', { method: 'POST', body: JSON.stringify(body) });
}
export function getTask(id: string) {
  return api<TaskRes>(`/api/tasks/${id}`);
}
export function updateTask(id: string, body: { title?: string; description?: string; status?: TaskStatus }) {
  return api<TaskRes>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}
export function deleteTask(id: string) {
  return api<{ message: string }>(`/api/tasks/${id}`, { method: 'DELETE' });
}
