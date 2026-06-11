import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AdminTable, Toolbar } from "./admin-shared";
import { ResultForm, type ResultFormValue } from "./ResultForm";
import { toast } from "sonner";
import { deleteResult, listItems, listPlayers, listResults, listTeams, updateResult } from "../api/admin";
import type { Item, MatchResult, Player, Team } from "../types/api";

export function AdminResults({ onNew }: { onNew: () => void }) {
  const [q, setQ] = useState("");
  const [itemFilter, setItemFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [rows, setRows] = useState<MatchResult[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [editing, setEditing] = useState<MatchResult | null>(null);
  const [deleting, setDeleting] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [itemData, playerRes, teamRes] = await Promise.all([
        listItems(),
        listPlayers({ page_size: 100 }),
        listTeams({ page_size: 100 }),
      ]);
      const resultRes = await listResults({
        search: q.trim(),
        item_id: itemFilter === "all" ? undefined : Number(itemFilter),
        match_date: dateFilter || undefined,
      });
      setRows(resultRes.data);
      setItems(itemData);
      setPlayers(playerRes.data);
      setTeams(teamRes.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "成绩数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [q, itemFilter, dateFilter]);

  const onSaveEdit = async (v: ResultFormValue) => {
    if (!editing) return;
    try {
      await updateResult(editing.id, v);
      setEditing(null);
      toast.success("已保存修改");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存修改失败");
    }
  };

  const onConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteResult(deleting.id);
      setDeleting(null);
      toast.success("已删除成绩");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除接口未开发或删除失败");
    }
  };

  return (
    <div className="space-y-4">
      <Toolbar
        search={<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索项目、球员、球队或备注" className="pl-9 bg-white" />}
        searchIcon={<Search className="w-4 h-4 text-[#9B95B5] absolute left-3 top-1/2 -translate-y-1/2" />}
        right={
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-[150px] bg-white"
            />
            <Select value={itemFilter} onValueChange={setItemFilter}>
              <SelectTrigger className="w-[160px] bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {items.map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={onNew} className="bg-[#6D3FE0] hover:bg-[#5C32CE] text-white">
              <Plus className="w-4 h-4 mr-1" /> 新增成绩
            </Button>
          </div>
        }
      />

      <AdminTable
        head={["日期", "场地", "年龄组", "对阵", "比分", "胜方", "来源", "操作"]}
        rows={rows.map(r => [
          formatDate(r.match_date),
          r.court || "—",
          r.age_group || r.group_name || "—",
          resultSubject(r),
          <span className="text-[#6B6586]">{r.score_text || "—"}</span>,
          <span className="text-[#5DBE3B]" style={{ fontWeight: 700 }}>{r.winner_team_name}</span>,
          <span className="text-[#6B6586]">{r.source_type === "excel" ? "Excel" : "手工"}</span>,
          <div className="flex gap-3">
            <button onClick={() => setEditing(r)} className="text-[#6D3FE0]">编辑</button>
            <button onClick={() => setDeleting(r)} className="text-[#E04848]">删除</button>
          </div>,
        ])}
        empty={loading ? "正在加载..." : "暂无成绩"}
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader><DialogTitle>编辑成绩</DialogTitle></DialogHeader>
          {editing && (
            <ResultForm
              initial={{
                item_id: editing.item_id,
                match_date: editing.match_date,
                sequence_no: editing.sequence_no,
                court: editing.court,
                group_name: editing.group_name,
                age_group: editing.age_group ?? editing.group_name,
                team_a_id: editing.team_a_id,
                team_b_id: editing.team_b_id,
                team_a_player_ids: editing.team_a_players.map(p => p.id),
                team_b_player_ids: editing.team_b_players.map(p => p.id),
                team_a_score: editing.team_a_score,
                team_b_score: editing.team_b_score,
                note: editing.note,
              }}
              players={players}
              teams={teams}
              items={items}
              submitLabel="保存修改"
              onSubmit={onSaveEdit}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>确认删除成绩？</DialogTitle></DialogHeader>
          <p className="text-[#6B6586]" style={{ fontSize: "13px" }}>删除后将同步影响公共端赛果和排行榜。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>取消</Button>
            <Button onClick={onConfirmDelete} className="bg-[#E04848] hover:bg-[#C73B3B] text-white">确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${year}.${month}.${day}` : value;
}

function resultSubject(result: MatchResult) {
  const aPlayers = result.team_a_players.map(player => player.name).join(" / ") || "—";
  const bPlayers = result.team_b_players.map(player => player.name).join(" / ") || "—";
  return (
    <div>
      <div>{result.team_a_name} vs {result.team_b_name}</div>
      <div className="text-[#9B95B5] mt-1" style={{ fontSize: "12px" }}>{aPlayers} / {bPlayers}</div>
    </div>
  );
}
