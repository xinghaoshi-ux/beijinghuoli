import { apiData, clearToken, setToken } from "./client";
import type { AdminUser, LoginResponse } from "../types/api";

export async function login(username: string, password: string) {
  const data = await apiData<LoginResponse>(
    "/admin/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    false,
  );
  setToken(data.access_token);
  return data;
}

export function logout() {
  clearToken();
}

export function getCurrentUser() {
  return apiData<AdminUser>("/admin/auth/me");
}
