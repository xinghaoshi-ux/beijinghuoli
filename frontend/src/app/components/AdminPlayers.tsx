import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { AdminTable, Toolbar, StatusBadge } from "./admin-shared";
import { createPlayer, listPlayers, listTeams, updatePlayer } from "../api/admin";
import type { Player, PlayerPayload, Team } from "../types/api";
import { toast } from "sonner";

export function AdminPlayers() {
  const [data, setData] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<(Partial<PlayerPayload> & { id?: number }) | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [playerRes, teamRes] = await Promise.all([
        listPlayers({ search: q.trim() }),
        listTeams({ page_size: 100 }),
      ]);
      setData(playerRes.data);
      setTeams(teamRes.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "球员数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [q]);

  const startNew = () => { setEditing({ name: "", team_id: null, phone: "", note: "", status: "active" }); setOpen(true); };
  const startEdit = (p: Player) => {
    setEditing({
      id: p.id,
      name: p.name,
      team_id: p.team_id,
      phone: p.phone ?? "",
      note: p.note ?? "",
      status: p.status,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    const payload: PlayerPayload = {
      name: editing.name?.trim() ?? "",
      team_id: editing.team_id ?? null,
      phone: editing.phone || null,
      note: editing.note || null,
      status: editing.status ?? "active",
    };
    if (!payload.name) {
      toast.error("请填写球员姓名");
      return;
    }
    try {
      if (editing.id) await updatePlayer(editing.id, payload);
      else await createPlayer(payload);
      toast.success("球员已保存");
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "球员保存失败");
    }
  };

  return (
    <div className="space-y-4">
      <Toolbar
        search={<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索球员姓名" className="pl-9 bg-white" />}
        searchIcon={<Search className="w-4 h-4 text-[#9B95B5] absolute left-3 top-1/2 -translate-y-1/2" />}
        right={
          <Button onClick={startNew} className="bg-[#6D3FE0] hover:bg-[#5C32CE] text-white">
            <Plus className="w-4 h-4 mr-1" /> 新建球员
          </Button>
        }
      />
      <AdminTable
        head={["姓名", "默认球队", "状态", "备注", "操作"]}
        rows={data.map(p => [
          <span className="text-[#1F1A38]" style={{ fontWeight: 600 }}>{p.name}</span>,
          p.team_name || "—",
          <StatusBadge active={p.status === "active"} />,
          <span className="text-[#6B6586]">{p.note || "—"}</span>,
          <button onClick={() => startEdit(p)} className="text-[#6D3FE0]" style={{ fontSize: "13px" }}>编辑</button>,
        ])}
        empty={loading ? "正在加载..." : "暂无球员"}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "编辑球员" : "新建球员"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Field label="姓名"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="默认球队">
                <Select value={editing.team_id ? String(editing.team_id) : "none"} onValueChange={(v) => setEditing({ ...editing, team_id: v === "none" ? null : Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="选择球队" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不归属球队</SelectItem>
                    {teams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="联系方式"><Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="手机号或邮箱" /></Field>
              <Field label="备注"><Textarea value={editing.note ?? ""} onChange={(e) => setEditing({ ...editing, note: e.target.value })} rows={2} /></Field>
              <Field label="状态">
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as "active" | "inactive" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">有效</SelectItem>
                    <SelectItem value="inactive">停用</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={save} className="bg-[#6D3FE0] hover:bg-[#5C32CE] text-white">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
