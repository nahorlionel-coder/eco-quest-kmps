/**
 * Tipis-tipis fetch wrapper untuk backend EcoQuest sendiri (Express + Prisma).
 *
 * Pakai ini di local development setelah `cd server && npm run dev`.
 * Set VITE_API_URL=http://localhost:3001 di .env.local
 *
 * Token JWT disimpan di localStorage["ecoquest_token"].
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const TOKEN_KEY = "ecoquest_token";

export const apiToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  init?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  const token = apiToken.get();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload, ...init });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = j.error?.message || (typeof j.error === "string" ? j.error : JSON.stringify(j.error)) || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get:    <T>(path: string)               => request<T>("GET", path),
  post:   <T>(path: string, body?: any)   => request<T>("POST", path, body),
  patch:  <T>(path: string, body?: any)   => request<T>("PATCH", path, body),
  delete: <T>(path: string)               => request<T>("DELETE", path),
  upload: <T>(path: string, file: File)   => {
    const fd = new FormData();
    fd.append("file", file);
    return request<T>("POST", path, fd);
  },
};

// ---------- Typed helpers ----------

export interface ApiUser {
  id: string;
  email: string;
  fullName?: string | null;
  profile?: ApiProfile | null;
}

export interface ApiProfile {
  id: string;
  userId: string;
  displayName?: string | null;
  department?: string | null;
  avatarUrl?: string | null;
  points: number;
  level: number;
  streak: number;
}

export const authApi = {
  signup: (email: string, password: string, fullName?: string) =>
    api.post<{ token: string; user: ApiUser }>("/auth/signup", { email, password, fullName }),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: ApiUser }>("/auth/login", { email, password }),
  me: () => api.get<{ user: ApiUser; roles: string[]; isAdmin: boolean }>("/auth/me"),
  logout: () => { apiToken.clear(); },
  googleStart: () => { window.location.href = `${BASE}/auth/google`; },
};

export const missionsApi = {
  list:           ()                         => api.get<any[]>("/missions"),
  myCompletions:  ()                         => api.get<any[]>("/missions/completions/me"),
  complete:       (body: any)                => api.post<any>("/missions/completions", body),
  adminAll:       ()                         => api.get<any[]>("/missions/admin/all"),
  adminCompletions: ()                       => api.get<any[]>("/missions/admin/completions"),
  review:         (id: string, status: "approved" | "rejected") =>
                                                api.patch<any>(`/missions/admin/completions/${id}`, { status }),
  create:         (body: any)                => api.post<any>("/missions/admin", body),
  update:         (id: string, body: any)    => api.patch<any>(`/missions/admin/${id}`, body),
  remove:         (id: string)               => api.delete<any>(`/missions/admin/${id}`),
};

export const rewardsApi = {
  list:           () => api.get<any[]>("/rewards"),
  redeem:         (rewardId: string, rewardTitle: string, pointsCost: number) =>
                       api.post<any>("/rewards/redeem", { rewardId, rewardTitle, pointsCost }),
  myRedemptions:  () => api.get<any[]>("/rewards/redemptions/me"),
  create:         (body: any) => api.post<any>("/rewards/admin", body),
  update:         (id: string, body: any) => api.patch<any>(`/rewards/admin/${id}`, body),
  remove:         (id: string) => api.delete<any>(`/rewards/admin/${id}`),
};

export const profilesApi = {
  list:    () => api.get<ApiProfile[]>("/profiles"),
  me:      () => api.get<ApiProfile>("/profiles/me"),
  update:  (body: Partial<ApiProfile>) => api.patch<ApiProfile>("/profiles/me", body),
};

export const rolesApi = {
  myRoles:        () => api.get<{ id: string; userId: string; role: string }[]>("/roles/me"),
  hasAnyAdmin:    () => api.get<{ hasAnyAdmin: boolean }>("/roles/has-any-admin"),
  bootstrapAdmin: () => api.post<any>("/roles/bootstrap-admin"),
  assign:         (userId: string, role: "admin" | "moderator" | "user") =>
                       api.post<any>("/roles/assign", { userId, role }),
};

export const uploadApi = {
  photo: (file: File) => api.upload<{ path: string; url: string }>("/upload/photo", file),
};
