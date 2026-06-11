import { useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { PublicHome } from "./components/PublicHome";
import { AdminLogin } from "./components/AdminLogin";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminPlayers } from "./components/AdminPlayers";
import { AdminTeams } from "./components/AdminTeams";
import { AdminResultEntry } from "./components/AdminResultEntry";
import { AdminResults } from "./components/AdminResults";
import { AdminRankings } from "./components/AdminRankings";
import { getCurrentUser, logout } from "./api/auth";
import { hasToken } from "./api/client";
import type { AdminUser } from "./types/api";

export type AdminPage = "dashboard" | "players" | "teams" | "result-entry" | "results" | "rankings";
type View =
  | { kind: "public" }
  | { kind: "admin-login" }
  | { kind: "admin"; page: AdminPage; rankingsTab?: "players" | "teams" };

function isAdminPath() {
  return window.location.pathname.startsWith("/admin");
}

export default function App() {
  const [view, setView] = useState<View>(isAdminPath() ? { kind: "admin-login" } : { kind: "public" });
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (!isAdminPath() || !hasToken()) return;
    getCurrentUser()
      .then((u) => {
        setUser(u);
        setView({ kind: "admin", page: "dashboard" });
      })
      .catch(() => logout());
  }, []);

  useEffect(() => {
    if (view.kind === "public") {
      document.title = "北京市活力网球交流系列赛赛果查看平台";
    } else {
      document.title = "赛事后台管理";
    }
  }, [view.kind]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setView({ kind: "admin-login" });
  };

  return (
    <div className="size-full">
      {view.kind === "public" && <PublicHome />}
      {view.kind === "admin-login" && (
        <AdminLogin
          onLogin={(u) => {
            setUser(u);
            setView({ kind: "admin", page: "dashboard" });
          }}
        />
      )}
      {view.kind === "admin" && (
        <AdminLayout
          current={view.page}
          onNavigate={(p) => setView({ kind: "admin", page: p })}
          onLogout={handleLogout}
          user={user}
        >
          {view.page === "dashboard" && (
            <AdminDashboard onSeeRankings={(tab) => setView({ kind: "admin", page: "rankings", rankingsTab: tab })} />
          )}
          {view.page === "players" && <AdminPlayers />}
          {view.page === "teams" && <AdminTeams />}
          {view.page === "result-entry" && <AdminResultEntry onSaved={() => setView({ kind: "admin", page: "results" })} />}
          {view.page === "results" && <AdminResults onNew={() => setView({ kind: "admin", page: "result-entry" })} />}
          {view.page === "rankings" && <AdminRankings initialTab={view.rankingsTab ?? "players"} />}
        </AdminLayout>
      )}
      <Toaster position="top-center" />
    </div>
  );
}
