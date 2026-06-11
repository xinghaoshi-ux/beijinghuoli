import { LayoutGrid, Users, Shield, FilePlus, ListChecks, BarChart3, LogOut } from "lucide-react";
import type { AdminPage } from "../App";
import type { AdminUser } from "../types/api";

const menu: { key: AdminPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "概览", icon: LayoutGrid },
  { key: "players", label: "球员管理", icon: Users },
  { key: "teams", label: "球队管理", icon: Shield },
  { key: "result-entry", label: "成绩录入", icon: FilePlus },
  { key: "results", label: "成绩管理", icon: ListChecks },
  { key: "rankings", label: "排名预览", icon: BarChart3 },
];

export function AdminLayout({
  current,
  onNavigate,
  onLogout,
  user,
  children,
}: {
  current: AdminPage;
  onNavigate: (p: AdminPage) => void;
  onLogout: () => void;
  user?: AdminUser | null;
  children: React.ReactNode;
}) {
  const title = menu.find(m => m.key === current)?.label ?? "";
  return (
    <div className="min-h-screen bg-[#F1EEFA] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[220px] bg-white border-r border-[#E0D9F0] flex-col">
        <div className="px-5 py-5 border-b border-[#EDE7FB]">
          <div className="text-[#1F1A38]" style={{ fontSize: "15px", fontWeight: 700 }}>🎾 赛事后台</div>
          <div className="text-[#9B95B5] mt-1" style={{ fontSize: "11px" }}>活力网球系列赛管理</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {menu.map(m => {
            const active = current === m.key;
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => onNavigate(m.key)}
                className={
                  "w-full flex items-center gap-2.5 h-10 px-3 rounded-[10px] transition text-left " +
                  (active ? "bg-[#6D3FE0] text-white shadow-sm" : "text-[#4B4566] hover:bg-[#F4F0FB]")
                }
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 bg-white border-b border-[#E0D9F0] flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="md:hidden text-[#1F1A38]" style={{ fontSize: "14px", fontWeight: 700 }}>🎾</span>
            <h2 className="text-[#1F1A38] truncate" style={{ fontSize: "16px", fontWeight: 600 }}>{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#6B6586]" style={{ fontSize: "13px" }}>
              {user?.display_name ?? "管理员"} · {user?.username ?? "admin"}
            </span>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E0D9F0] text-[#4B4566] hover:bg-[#F4F0FB]"
              style={{ fontSize: "12px" }}
            >
              <LogOut className="w-3.5 h-3.5" /> 退出
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden flex overflow-x-auto gap-1.5 px-3 py-2 bg-white border-b border-[#E0D9F0]">
          {menu.map(m => {
            const active = current === m.key;
            return (
              <button
                key={m.key}
                onClick={() => onNavigate(m.key)}
                className={
                  "shrink-0 h-8 px-3 rounded-full " +
                  (active ? "bg-[#6D3FE0] text-white" : "bg-[#F4F0FB] text-[#4B4566]")
                }
                style={{ fontSize: "12px" }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
