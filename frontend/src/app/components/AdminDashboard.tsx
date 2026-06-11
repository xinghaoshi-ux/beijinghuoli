import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getDashboard } from "../api/admin";
import type { Dashboard } from "../types/api";
import { toast } from "sonner";

export function AdminDashboard({ onSeeRankings }: { onSeeRankings: (tab: "players" | "teams") => void }) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch(error => toast.error(error instanceof Error ? error.message : "概览数据加载失败"));
  }, []);

  const stats = [
    { title: "球员数量", value: dashboard?.player_count ?? 0, hint: "已录入球员" },
    { title: "球队数量", value: dashboard?.team_count ?? 0, hint: "全部参赛队伍" },
    { title: "比赛场次", value: dashboard?.result_count ?? 0, hint: "已录入对阵赛果" },
    { title: "当前规则", value: "胜盘", hint: "团体胜场、胜盘、胜局、净胜局", green: true },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(s => (
          <div key={s.title} className="bg-white rounded-[16px] border border-[#EDE7FB] p-4 md:p-5 shadow-[0_2px_10px_rgba(109,63,224,0.04)]">
            <div className="text-[#6B6586]" style={{ fontSize: "12px" }}>{s.title}</div>
            <div
              className={"mt-2 " + (s.green ? "text-[#5DBE3B]" : "text-[#1F1A38]")}
              style={{ fontSize: "26px", fontWeight: 700 }}
            >
              {s.value}
            </div>
            <div className="text-[#9B95B5] mt-1" style={{ fontSize: "11px" }}>{s.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankCard
          title="个人排名前三"
          onSeeAll={() => onSeeRankings("players")}
          rows={(dashboard?.top_players ?? []).map(e => ({
            key: e.player_id,
            rank: e.rank,
            name: e.player_name,
            sub: `${e.team_name || "未归属球队"} · ${e.appearance_count} 场 ${e.set_win_count} 胜盘`,
            points: e.games_for,
          }))}
          ctaLabel="查看全部个人排名"
        />
        <RankCard
          title="球队排名前三"
          onSeeAll={() => onSeeRankings("teams")}
          rows={(dashboard?.top_teams ?? []).map(e => ({
            key: e.team_id,
            rank: e.rank,
            name: e.team_name,
            sub: `${e.duel_win_count}胜 ${e.duel_loss_count}负 · ${e.set_win_count} 胜盘`,
            points: e.games_for,
          }))}
          ctaLabel="查看全部球队排名"
        />
      </div>
    </div>
  );
}

function RankCard({ title, rows, ctaLabel, onSeeAll }: { title: string; rows: { key: number; rank: number; name: string; sub: string; points: number }[]; ctaLabel: string; onSeeAll: () => void }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#EDE7FB] p-5 shadow-[0_2px_10px_rgba(109,63,224,0.04)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#1F1A38]" style={{ fontSize: "15px", fontWeight: 600 }}>{title}</h3>
        <button onClick={onSeeAll} className="inline-flex items-center gap-1 text-[#6D3FE0]" style={{ fontSize: "12px" }}>
          {ctaLabel} <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-2">
        {rows.length === 0 && <div className="text-[#9B95B5] py-6 text-center" style={{ fontSize: "12px" }}>暂无数据</div>}
        {rows.map(r => (
          <div key={r.key} className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] bg-[#F7F4FD]">
            <span className="text-[#6D3FE0]" style={{ fontSize: "16px", fontWeight: 700 }}>#{r.rank}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[#1F1A38] truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{r.name}</div>
              <div className="text-[#9B95B5]" style={{ fontSize: "11px" }}>{r.sub}</div>
            </div>
            <span className="text-[#5DBE3B]" style={{ fontSize: "14px", fontWeight: 700 }}>{r.points} 胜局</span>
          </div>
        ))}
      </div>
    </div>
  );
}
