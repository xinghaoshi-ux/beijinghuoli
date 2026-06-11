import { useEffect, useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Item, Player, ResultPayload, Team } from "../types/api";

export type ResultFormValue = ResultPayload;

export function ResultForm({
  initial,
  players,
  teams,
  items,
  onSubmit,
  submitLabel = "保存成绩",
  onCancel,
}: {
  initial?: Partial<ResultFormValue>;
  players: Player[];
  teams: Team[];
  items: Item[];
  onSubmit: (v: ResultFormValue) => void | Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  const firstItem = items[0];
  const [v, setV] = useState<ResultFormValue>({
    item_id: initial?.item_id ?? firstItem?.id ?? 0,
    match_date: initial?.match_date ?? todayInputValue(),
    sequence_no: initial?.sequence_no ?? null,
    court: initial?.court ?? "",
    group_name: initial?.age_group ?? initial?.group_name ?? "",
    age_group: initial?.age_group ?? initial?.group_name ?? "",
    team_a_id: initial?.team_a_id ?? teams[0]?.id ?? 0,
    team_b_id: initial?.team_b_id ?? teams[1]?.id ?? 0,
    team_a_player_ids: initial?.team_a_player_ids ?? [],
    team_b_player_ids: initial?.team_b_player_ids ?? [],
    team_a_score: initial?.team_a_score ?? 0,
    team_b_score: initial?.team_b_score ?? 0,
    note: initial?.note ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  const currentItem = useMemo(
    () => items.find(item => item.id === v.item_id) ?? firstItem,
    [firstItem, items, v.item_id],
  );
  const playerCount = currentItem?.player_count ?? 1;

  useEffect(() => {
    if (items.length > 0 && !items.some(item => item.id === v.item_id)) {
      setV(s => ({ ...s, item_id: items[0].id }));
    }
  }, [items, v.item_id]);

  useEffect(() => {
    if (!v.team_a_id && teams[0]) setV(s => ({ ...s, team_a_id: teams[0].id }));
    if (!v.team_b_id && teams[1]) setV(s => ({ ...s, team_b_id: teams[1].id }));
  }, [teams, v.team_a_id, v.team_b_id]);

  const teamAPlayers = players.filter(player => player.team_id === v.team_a_id);
  const teamBPlayers = players.filter(player => player.team_id === v.team_b_id);

  const setPlayer = (side: "A" | "B", index: number, value: string) => {
    const playerId = Number(value);
    const key = side === "A" ? "team_a_player_ids" : "team_b_player_ids";
    const next = [...v[key]];
    next[index] = playerId;
    setV({ ...v, [key]: next.filter(Boolean) });
  };

  const setTeam = (side: "A" | "B", teamId: number) => {
    if (side === "A") {
      setV({ ...v, team_a_id: teamId, team_a_player_ids: [] });
    } else {
      setV({ ...v, team_b_id: teamId, team_b_player_ids: [] });
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        ...v,
        match_date: v.match_date || null,
        sequence_no: v.sequence_no ? Number(v.sequence_no) : null,
        court: v.court || null,
        group_name: v.age_group || v.group_name || null,
        age_group: v.age_group || v.group_name || null,
        note: v.note || null,
        team_a_player_ids: v.team_a_player_ids.slice(0, playerCount),
        team_b_player_ids: v.team_b_player_ids.slice(0, playerCount),
        team_a_score: Number(v.team_a_score) || 0,
        team_b_score: Number(v.team_b_score) || 0,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-[14px] border border-[#E0D9F0] bg-[#F7F4FD] p-4 text-[#6B6586]" style={{ fontSize: "13px" }}>
        未开发：当前前端没有比赛项目管理页面。请先通过后端 API 或数据库配置比赛项目后，再录入成绩。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="比赛日期">
          <Input
            type="date"
            value={v.match_date ?? ""}
            onChange={(e) => setV({ ...v, match_date: e.target.value })}
          />
        </Field>
        <Field label="场地">
          <Input value={v.court ?? ""} onChange={(e) => setV({ ...v, court: e.target.value })} placeholder="如 1 号场" />
        </Field>
        <Field label="年龄组">
          <Input
            value={v.age_group ?? v.group_name ?? ""}
            onChange={(e) => setV({ ...v, age_group: e.target.value, group_name: e.target.value })}
            placeholder="如 90岁组"
          />
        </Field>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SideBlock
          label="A 队"
          teamId={v.team_a_id}
          teams={teams}
          players={teamAPlayers}
          selectedPlayerIds={v.team_a_player_ids}
          playerCount={playerCount}
          score={v.team_a_score}
          onTeamChange={(teamId) => setTeam("A", teamId)}
          onPlayerChange={(index, playerId) => setPlayer("A", index, playerId)}
          onScoreChange={(score) => setV({ ...v, team_a_score: score })}
        />
        <SideBlock
          label="B 队"
          teamId={v.team_b_id}
          teams={teams}
          players={teamBPlayers}
          selectedPlayerIds={v.team_b_player_ids}
          playerCount={playerCount}
          score={v.team_b_score}
          onTeamChange={(teamId) => setTeam("B", teamId)}
          onPlayerChange={(index, playerId) => setPlayer("B", index, playerId)}
          onScoreChange={(score) => setV({ ...v, team_b_score: score })}
        />
      </div>

      <Field label="备注">
        <Textarea value={v.note ?? ""} onChange={(e) => setV({ ...v, note: e.target.value })} rows={2} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button variant="outline" onClick={onCancel}>取消</Button>}
        <Button disabled={submitting} onClick={submit} className="bg-[#6D3FE0] hover:bg-[#5C32CE] text-white">
          {submitting ? "保存中..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}

function SideBlock({
  label,
  teamId,
  teams,
  players,
  selectedPlayerIds,
  playerCount,
  score,
  onTeamChange,
  onPlayerChange,
  onScoreChange,
}: {
  label: string;
  teamId: number;
  teams: Team[];
  players: Player[];
  selectedPlayerIds: number[];
  playerCount: number;
  score: number;
  onTeamChange: (teamId: number) => void;
  onPlayerChange: (index: number, playerId: string) => void;
  onScoreChange: (score: number) => void;
}) {
  return (
    <div className="rounded-[14px] border border-[#EDE7FB] bg-[#FAF8FE] p-4 space-y-3">
      <Field label={`${label}球队`}>
        <Select value={teamId ? String(teamId) : ""} onValueChange={(value) => onTeamChange(Number(value))}>
          <SelectTrigger><SelectValue placeholder="选择球队" /></SelectTrigger>
          <SelectContent>{teams.map(team => <SelectItem key={team.id} value={String(team.id)}>{team.name}</SelectItem>)}</SelectContent>
        </Select>
      </Field>

      {Array.from({ length: playerCount }).map((_, index) => (
        <Field key={index} label={`${label}球员 ${index + 1}`}>
          <Select value={selectedPlayerIds[index] ? String(selectedPlayerIds[index]) : ""} onValueChange={(value) => onPlayerChange(index, value)}>
            <SelectTrigger><SelectValue placeholder="选择球员" /></SelectTrigger>
            <SelectContent>
              {players.map(player => (
                <SelectItem key={player.id} value={String(player.id)}>{player.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ))}

      <Field label={`${label}比分`}>
        <Input type="number" min={0} value={score} onChange={(e) => onScoreChange(Number(e.target.value) || 0)} />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label style={{ fontSize: "12px" }}>{label}</Label>
      {children}
    </div>
  );
}

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
