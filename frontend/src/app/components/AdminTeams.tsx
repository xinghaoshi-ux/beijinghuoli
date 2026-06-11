import { useEffect, useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "./ui/sheet";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { AdminTable, Toolbar, StatusBadge } from "./admin-shared";
import { createTeam, listPlayers, listTeamMembers, listTeams, saveTeamMembers, updateTeam } from "../api/admin";
import type { Player, Team, TeamMember, TeamPayload } from "../types/api";
import { toast } from "sonner";

type EditingTeam = Partial<TeamPayload> & { id?: number };

export function AdminTeams() {
  const [data, setData] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<EditingTeam | null>(null);
  const [open, setOpen] = useState(false);
  const [memberOf, setMemberOf] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [teamRes, playerRes] = await Promise.all([
        listTeams({ search: q.trim() }),
        listPlayers({ page_size: 100 }),
      ]);
      setData(teamRes.data);
      setPlayers(playerRes.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "球队数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [q]);

  const startNew = () => { setEditing({ name: "", note: "", status: "active" }); setOpen(true); };
  const startEdit = (t: Team) => { setEditing({ id: t.id, name: t.name, note: t.note ?? "", status: t.status }); setOpen(true); };

  const save = async () => {
    if (!editing) return;
    const payload: TeamPayload = {
      name: editing.name?.trim() ?? "",
      note: editing.note || null,
      status: editing.status ?? "active",
    };
    if (!payload.name) {
      toast.error("请填写球队名称");
      return;
    }
    try {
      if (editing.id) await updateTeam(editing.id, payload);
      else await createTeam(payload);
      toast.success("球队已保存");
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "球队保存失败");
    }
  };

  const openMembers = async (team: Team) => {
    setMemberOf(team);
    try {
      const teamMembers = await listTeamMembers(team.id);
      setMembers(teamMembers);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "成员加载失败");
    }
  };

  const memberName = (playerId: number) => players.find(p => p.id === playerId)?.name ?? "未知球员";

  const saveMembers = async () => {
    if (!memberOf) return;
    try {
      await saveTeamMembers(memberOf.id, members);
      toast.success("成员已保存");
      setMemberOf(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "成员保存失败");
    }
  };

  return (
    <div className="space-y-4">
      <Toolbar
        search={<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索球队名称" className="pl-9 bg-white" />}
        searchIcon={<Search className="w-4 h-4 text-[#9B95B5] absolute left-3 top-1/2 -translate-y-1/2" />}
        right={<Button onClick={startNew} className="bg-[#6D3FE0] hover:bg-[#5C32CE] text-white"><Plus className="w-4 h-4 mr-1" /> 新建球队</Button>}
      />

      <AdminTable
        head={["球队名称", "成员数", "状态", "备注", "操作"]}
        rows={data.map(t => [
          <span style={{ fontWeight: 600 }}>{t.name}</span>,
          `${t.member_count ?? 0} 人`,
          <StatusBadge active={t.status === "active"} />,
          <span className="text-[#6B6586]">{t.note || "—"}</span>,
          <div className="flex gap-3">
            <button onClick={() => openMembers(t)} className="text-[#6D3FE0]">成员管理</button>
            <button onClick={() => startEdit(t)} className="text-[#6D3FE0]">编辑</button>
          </div>,
        ])}
        empty={loading ? "正在加载..." : "暂无球队"}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader><DialogTitle>{editing?.id ? "编辑球队" : "新建球队"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Field label="球队名称"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
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

      <Sheet open={!!memberOf} onOpenChange={(o) => !o && setMemberOf(null)}>
        <SheetContent className="sm:max-w-[420px]">
          {memberOf && (
            <>
              <SheetHeader><SheetTitle>球队成员</SheetTitle></SheetHeader>
              <div className="px-4 py-3 space-y-4">
                <div>
                  <div className="text-[#9B95B5]" style={{ fontSize: "11px" }}>球队名称</div>
                  <div className="text-[#1F1A38]" style={{ fontSize: "15px", fontWeight: 600 }}>{memberOf.name}</div>
                </div>
                <div>
                  <Label style={{ fontSize: "12px" }}>已选成员</Label>
                  <div className="mt-2 space-y-2">
                    {members.length === 0 && <div className="text-[#9B95B5]" style={{ fontSize: "12px" }}>暂无成员</div>}
                    {members.map(m => (
                      <div key={m.player_id} className="flex items-center justify-between bg-[#F7F4FD] rounded-[10px] px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[#1F1A38]" style={{ fontSize: "13px", fontWeight: 600 }}>{m.player_name ?? memberName(m.player_id)}</span>
                          <button
                            onClick={() => setMembers(ms => ms.map(x => x.player_id === m.player_id ? { ...x, role: x.role === "captain" ? "member" : "captain" } : { ...x, role: "member" }))}
                            className={"rounded-full px-2 py-0.5 " + (m.role === "captain" ? "bg-[#D4F751] text-[#1F1A38]" : "bg-white text-[#6B6586] border border-[#E0D9F0]")}
                            style={{ fontSize: "10px" }}
                          >
                            {m.role === "captain" ? "队长" : "成员"}
                          </button>
                          <span className="text-[#9B95B5]" style={{ fontSize: "10px" }}>
                            点击标签切换队长
                          </span>
                        </div>
                        <button onClick={() => setMembers(ms => ms.filter(x => x.player_id !== m.player_id))}>
                          <X className="w-4 h-4 text-[#9B95B5]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label style={{ fontSize: "12px" }}>添加成员</Label>
                  <Select onValueChange={(v) => {
                    const playerId = Number(v);
                    if (!members.some(m => m.player_id === playerId)) {
                      setMembers(ms => [...ms, { player_id: playerId, player_name: memberName(playerId), role: "member", is_active: true }]);
                    }
                  }}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="选择球员加入" /></SelectTrigger>
                    <SelectContent>
                      {players.filter(p => !members.some(m => m.player_id === p.id)).map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter className="px-4 pb-4">
                <Button variant="outline" onClick={() => setMemberOf(null)}>取消</Button>
                <Button onClick={saveMembers} className="bg-[#6D3FE0] hover:bg-[#5C32CE] text-white">保存成员</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
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
