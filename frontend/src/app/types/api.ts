export type Status = "active" | "inactive";
export type ResultScope = "individual" | "team";

export type SingleResponse<T> = {
  data: T;
  message?: string;
};

export type ListResponse<T> = {
  data: T[];
  total: number;
  page: number;
  page_size: number;
};

export type EventInfo = {
  name: string;
  subtitle: string;
  description: string | null;
};

export type PublicFilterTeam = {
  id: number;
  name: string;
  short_name?: string | null;
};

export type PublicFilterOptions = {
  match_months: string[];
  match_dates: string[];
  teams: PublicFilterTeam[];
  age_groups: string[];
};

export type AdminUser = {
  id: number;
  username: string;
  display_name: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AdminUser;
};

export type Team = {
  id: number;
  name: string;
  member_count?: number;
  note: string | null;
  status: Status;
  created_at?: string;
};

export type TeamPayload = {
  name: string;
  note?: string | null;
  status: Status;
};

export type Player = {
  id: number;
  name: string;
  team_id: number | null;
  team_name: string | null;
  phone: string | null;
  note: string | null;
  status: Status;
  created_at?: string;
};

export type PlayerPayload = {
  name: string;
  team_id?: number | null;
  phone?: string | null;
  note?: string | null;
  status: Status;
};

export type TeamMember = {
  id?: number;
  player_id: number;
  player_name?: string;
  role: "member" | "captain";
  is_active: boolean;
};

export type Item = {
  id: number;
  name: string;
  item_type: ResultScope;
  player_count: number;
  display_order: number | null;
  sort_order: number | null;
  note: string | null;
};

export type ResultPlayer = {
  id: number;
  name: string;
  team_name: string | null;
};

export type ResultTeam = {
  id: number;
  name: string;
};

export type MatchResult = {
  id: number;
  match_date?: string | null;
  sequence_no: number | null;
  court: string | null;
  group_name: string | null;
  age_group?: string | null;
  item_id: number;
  item_name: string;
  team_a_id: number;
  team_a_name: string;
  team_b_id: number;
  team_b_name: string;
  team_a_players: ResultPlayer[];
  team_b_players: ResultPlayer[];
  team_a_score: number;
  team_b_score: number;
  score_text: string;
  winner_team_id: number;
  winner_team_name: string;
  note: string | null;
  source_type?: string;
  upload_batch_id?: number | null;
  created_at?: string;
};

export type ResultPayload = {
  item_id: number;
  match_date?: string | null;
  sequence_no?: number | null;
  court?: string | null;
  group_name?: string | null;
  age_group?: string | null;
  team_a_id: number;
  team_b_id: number;
  team_a_player_ids: number[];
  team_b_player_ids: number[];
  team_a_score: number;
  team_b_score: number;
  note?: string | null;
};

export type PlayerRanking = {
  rank: number;
  ranking: number;
  global_rank?: number | null;
  team_rank?: number | null;
  player_id: number;
  player_name: string;
  team_id: number | null;
  team_name: string | null;
  appearance_count: number;
  set_win_count: number;
  set_loss_count: number;
  games_for: number;
  games_against: number;
  net_games: number;
  win_count: number;
  total_score: number;
  total_points: number;
  result_count: number;
};

export type TeamRanking = {
  rank: number;
  ranking: number;
  team_id: number;
  team_name: string;
  duel_win_count: number;
  duel_loss_count: number;
  set_win_count: number;
  set_loss_count: number;
  games_for: number;
  games_against: number;
  net_games: number;
  match_win_count: number;
  match_loss_count: number;
  total_score: number;
  opponent_results: string[];
  total_points: number;
  result_count: number;
};

export type Dashboard = {
  player_count: number;
  team_count: number;
  result_count: number;
  individual_result_count?: number;
  team_result_count?: number;
  top_players: PlayerRanking[];
  top_teams: TeamRanking[];
};

export type UploadBatch = {
  id: number;
  filename: string;
  status: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
};

export type UploadPreviewRow = {
  row_number: number;
  row_status: "normal" | "error";
  match_date?: string | null;
  sequence_no?: number | null;
  court?: string | null;
  group_name?: string | null;
  age_group?: string | null;
  item_name?: string | null;
  item_id?: number | null;
  team_a_name?: string | null;
  team_a_id?: number | null;
  team_a_player_names?: string[];
  team_a_player_ids?: number[];
  team_a_score?: number | null;
  team_b_name?: string | null;
  team_b_id?: number | null;
  team_b_player_names?: string[];
  team_b_player_ids?: number[];
  team_b_score?: number | null;
  score_text?: string | null;
  note?: string | null;
  error_message?: string | null;
};
