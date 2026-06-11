import { useState, useEffect } from "react";
import { AdminTable } from "./admin-shared";
import { listAdminPlayerRankings, listAdminTeamRankings } from "../api/admin";
import type { PlayerRanking, TeamRanking } from "../types/api";
import { toast } from "sonner";

export function AdminRankings({ initialTab = "players" }: { initialTab?: "players" | "teams" }) {
  const [tab, setTab] = useState<"players" | "teams">(initialTab);
  const [playerRows, setPlayerRows] = useState<PlayerRanking[]>([]);
  const [teamRows, setTeamRows] = useState<TeamRanking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  useEffect(() => {
    setLoading(true);
    const req = tab === "players" ? listAdminPlayerRankings({ page_size: 100 }) : listAdminTeamRankings({ page_size: 100 });
    req
      .then(res => {
        if (tab === "players") setPlayerRows(res.data);
        else setTeamRows(res.data);
      })
      .catch(error => toast.error(error instanceof Error ? error.message : "排名数据加载失败"))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[16px] border border-[#EDE7FB] p-1.5 inline-flex">
        <TabBtn active={tab === "players"} onClick={() => setTab("players")}>个人排名</TabBtn>
        <TabBtn active={tab === "teams"} onClick={() => setTab("teams")}>球队排名</TabBtn>
      </div>

      {tab === "players" ? (
        <AdminTable
          head={["排名", "球员", "所属球队", "出场", "胜盘", "胜局", "净胜局"]}
          rows={playerRows.map((e) => [
            <RankNum n={e.rank} />,
            <span style={{ fontWeight: 600 }}>{e.player_name}</span>,
            <span className="text-[#6B6586]">{e.team_name || "未归属球队"}</span>,
            <span className="text-[#6B6586]">{e.appearance_count}</span>,
            <span className="text-[#6B6586]">{e.set_win_count}</span>,
            <span className="text-[#6B6586]">{e.games_for}</span>,
            <span className="text-[#5DBE3B]" style={{ fontWeight: 700 }}>{e.net_games > 0 ? `+${e.net_games}` : e.net_games}</span>,
          ])}
          empty={loading ? "正在加载..." : "暂无个人排名"}
        />
      ) : (
        <AdminTable
          head={["排名", "球队", "团体战绩", "胜盘", "胜局", "净胜局"]}
          rows={teamRows.map((e) => [
            <RankNum n={e.rank} />,
            <span style={{ fontWeight: 600 }}>{e.team_name}</span>,
            <span className="text-[#6B6586]">{e.duel_win_count}胜 {e.duel_loss_count}负</span>,
            <span className="text-[#6B6586]">{e.set_win_count}</span>,
            <span className="text-[#6B6586]">{e.games_for}</span>,
            <span className="text-[#5DBE3B]" style={{ fontWeight: 700 }}>{e.net_games > 0 ? `+${e.net_games}` : e.net_games}</span>,
          ])}
          empty={loading ? "正在加载..." : "暂无球队排名"}
        />
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={"h-9 px-4 rounded-[10px] " + (active ? "bg-[#6D3FE0] text-white" : "text-[#4B4566]")}
      style={{ fontSize: "13px", fontWeight: 500 }}
    >
      {children}
    </button>
  );
}

function RankNum({ n }: { n: number }) {
  const top = n <= 3;
  return <span className={top ? "text-[#6D3FE0]" : "text-[#6B6586]"} style={{ fontWeight: 700 }}>#{n}</span>;
}
