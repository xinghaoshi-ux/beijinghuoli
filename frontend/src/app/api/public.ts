import { apiData, apiRequest, toQuery } from "./client";
import type {
  EventInfo,
  ListResponse,
  MatchResult,
  PlayerRanking,
  PublicFilterOptions,
  TeamRanking,
} from "../types/api";

type PublicMatchParams = {
  search?: string;
  item_id?: number;
  team_id?: number;
  player_id?: number;
  match_date?: string;
  match_month?: string;
  age_group?: string;
  page?: number;
  page_size?: number;
};

type PublicRankingParams = {
  search?: string;
  scope?: "global" | "team";
  team_id?: number;
  match_date?: string;
  match_month?: string;
  age_group?: string;
  page?: number;
  page_size?: number;
};

export function getEventInfo() {
  return apiData<EventInfo>("/public/event-info", {}, false);
}

export function getPublicFilterOptions(params: { match_month?: string; team_id?: number } = {}) {
  return apiData<PublicFilterOptions>(`/public/filter-options${toQuery(params)}`, {}, false);
}

export function getPublicResults(params: PublicMatchParams) {
  return apiRequest<ListResponse<MatchResult>>(
    `/public/matches${toQuery({ page: 1, page_size: 100, ...params })}`,
    {},
    false,
  );
}

export function getPublicPlayerRankings(params: PublicRankingParams) {
  return apiRequest<ListResponse<PlayerRanking>>(
    `/public/rankings/players${toQuery({ page: 1, page_size: 100, ...params })}`,
    {},
    false,
  );
}

export function getPublicTeamRankings(params: PublicRankingParams) {
  return apiRequest<ListResponse<TeamRanking>>(
    `/public/rankings/teams${toQuery({ page: 1, page_size: 100, ...params })}`,
    {},
    false,
  );
}
