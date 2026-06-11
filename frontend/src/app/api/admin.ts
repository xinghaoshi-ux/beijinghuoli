import { apiData, apiRequest, toQuery } from "./client";
import type {
  Dashboard,
  Item,
  ListResponse,
  MatchResult,
  Player,
  PlayerPayload,
  PlayerRanking,
  ResultPayload,
  Team,
  TeamMember,
  TeamPayload,
  TeamRanking,
  UploadBatch,
  UploadPreviewRow,
} from "../types/api";

export function getDashboard() {
  return apiData<Dashboard>("/admin/dashboard");
}

export function listPlayers(params: { search?: string; page?: number; page_size?: number } = {}) {
  return apiRequest<ListResponse<Player>>(`/admin/players${toQuery({ page: 1, page_size: 100, ...params })}`);
}

export function createPlayer(payload: PlayerPayload) {
  return apiData<Player>("/admin/players", { method: "POST", body: JSON.stringify(payload) });
}

export function updatePlayer(id: number, payload: PlayerPayload) {
  return apiData<Player>(`/admin/players/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function listTeams(params: { search?: string; page?: number; page_size?: number } = {}) {
  return apiRequest<ListResponse<Team>>(`/admin/teams${toQuery({ page: 1, page_size: 100, ...params })}`);
}

export function createTeam(payload: TeamPayload) {
  return apiData<Team>("/admin/teams", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTeam(id: number, payload: TeamPayload) {
  return apiData<Team>(`/admin/teams/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function listTeamMembers(teamId: number) {
  return apiData<TeamMember[]>(`/admin/teams/${teamId}/members`);
}

export function saveTeamMembers(teamId: number, members: TeamMember[]) {
  return apiData<TeamMember[]>(`/admin/teams/${teamId}/members`, {
    method: "PUT",
    body: JSON.stringify({ members }),
  });
}

export function listItems() {
  return apiData<Item[]>("/admin/items");
}

export function listResults(params: {
  search?: string;
  item_id?: number;
  team_id?: number;
  match_date?: string;
  match_month?: string;
  age_group?: string;
  page?: number;
  page_size?: number;
} = {}) {
  return apiRequest<ListResponse<MatchResult>>(`/admin/matches${toQuery({ page: 1, page_size: 100, ...params })}`);
}

export function createResult(payload: ResultPayload) {
  return apiData<MatchResult>("/admin/matches", { method: "POST", body: JSON.stringify(payload) });
}

export function updateResult(id: number, payload: ResultPayload) {
  return apiData<MatchResult>(`/admin/matches/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteResult(id: number) {
  return apiRequest<{ message?: string }>(`/admin/matches/${id}`, { method: "DELETE" });
}

export function listAdminPlayerRankings(params: { search?: string; page?: number; page_size?: number } = {}) {
  return apiRequest<ListResponse<PlayerRanking>>(
    `/admin/rankings/players${toQuery({ page: 1, page_size: 100, ...params })}`,
  );
}

export function listAdminTeamRankings(params: { search?: string; page?: number; page_size?: number } = {}) {
  return apiRequest<ListResponse<TeamRanking>>(
    `/admin/rankings/teams${toQuery({ page: 1, page_size: 100, ...params })}`,
  );
}

export function uploadExcel(file: File) {
  const form = new FormData();
  form.set("file", file);
  return apiData<UploadBatch>("/admin/uploads", { method: "POST", body: form });
}

export function getUploadPreview(uploadId: number) {
  return apiData<UploadPreviewRow[]>(`/admin/uploads/${uploadId}/preview`);
}

export function confirmUpload(uploadId: number, confirmedRows: number[]) {
  return apiData<{ imported_count: number; ignored_count: number }>(`/admin/uploads/${uploadId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ confirmed_rows: confirmedRows }),
  });
}

export function cancelUpload(uploadId: number) {
  return apiData<UploadBatch>(`/admin/uploads/${uploadId}/cancel`, { method: "POST" });
}
