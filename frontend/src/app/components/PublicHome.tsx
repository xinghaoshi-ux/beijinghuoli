import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Info, ListOrdered, Search, Trophy, UserRound, Users } from "lucide-react";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import headerSwoosh from "../../imports/ChatGPT_Image_2026_6_8__00_57_08-3.png";
import emptyArtwork from "../../imports/ChatGPT_Image_2026_6_8__00_57_14.png";
import teamRank1 from "../../assets/rankings/team-rank-1.svg";
import teamRank2 from "../../assets/rankings/team-rank-2.svg";
import teamRank3 from "../../assets/rankings/team-rank-3.svg";
import {
  getEventInfo,
  getPublicFilterOptions,
  getPublicPlayerRankings,
  getPublicResults,
  getPublicTeamRankings,
} from "../api/public";
import { nameToInitials, playerNamesInitials } from "../utils/pinyin";
import type { EventInfo, MatchResult, PlayerRanking, PublicFilterOptions, TeamRanking } from "../types/api";

type Tab = "results" | "teams" | "players";

export function PublicHome() {
  const [tab, setTab] = useState<Tab>("results");
  const [q, setQ] = useState("");
  const [matchMonth, setMatchMonth] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [teamId, setTeamId] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [filterOptions, setFilterOptions] = useState<PublicFilterOptions>({
    match_months: [],
    match_dates: [],
    teams: [],
    age_groups: [],
  });
  const [defaultDateApplied, setDefaultDateApplied] = useState(false);
  const [eventInfo, setEventInfo] = useState<EventInfo>({
    name: "北京市活力网球交流系列赛",
    subtitle: "赛果查看平台",
    description: null,
  });
  const [results, setResults] = useState<MatchResult[]>([]);
  const [teamRankings, setTeamRankings] = useState<TeamRanking[]>([]);
  const [playerRankings, setPlayerRankings] = useState<PlayerRanking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    getEventInfo().then(setEventInfo).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getPublicFilterOptions({
      match_month: matchMonth || undefined,
      team_id: teamId ? Number(teamId) : undefined,
    })
      .then((data) => {
        if (cancelled) return;
        setFilterOptions(data);
        if (matchDate && !data.match_dates.includes(matchDate)) {
          setMatchDate("");
        }
        if (!defaultDateApplied && !matchMonth && !matchDate && data.match_dates[0]) {
          setMatchDate(data.match_dates[0]);
          setDefaultDateApplied(true);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [defaultDateApplied, matchDate, matchMonth, teamId]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const search = q.trim() || undefined;
        const selectedTeamId = teamId ? Number(teamId) : undefined;
        const resultFilters = {
          search,
          match_month: matchMonth || undefined,
          match_date: matchDate || undefined,
          age_group: ageGroup || undefined,
        };
        if (tab === "results") {
          const res = await getPublicResults({ ...resultFilters, team_id: selectedTeamId });
          setResults(res.data);
        } else if (tab === "teams") {
          const res = await getPublicTeamRankings({ search, team_id: selectedTeamId });
          setTeamRankings(res.data);
        } else {
          const res = await getPublicPlayerRankings({
            search,
            team_id: selectedTeamId,
          });
          setPlayerRankings(res.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "数据加载失败");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [ageGroup, matchDate, matchMonth, q, tab, teamId, reloadKey]);

  const resetFilters = () => {
    setQ("");
    setMatchMonth("");
    setAgeGroup("");
    setTeamId("");
    setMatchDate("");
    setDefaultDateApplied(true);
  };

  const hasActiveFilters = tab === "results"
    ? Boolean(q.trim() || matchMonth || matchDate || teamId || ageGroup)
    : Boolean(q.trim() || teamId);

  return (
    <div className="min-h-screen bg-[#F2EEFA] py-5 px-4 md:py-7">
      <div className="max-w-[1380px] mx-auto space-y-5 md:space-y-6">
        {/* Header */}
        <div className="relative bg-white rounded-[20px] md:rounded-[24px] shadow-[0_10px_30px_rgba(82,65,132,0.08)] overflow-hidden min-h-[154px] md:min-h-[166px] p-4 md:p-5">
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-[#151031] leading-tight tracking-normal" style={{ fontSize: "28px", fontWeight: 600, WebkitFontSmoothing: "antialiased" }}>
                {eventInfo.name}
              </h1>
              <p className="text-[#6B6586] tracking-[0.08em]" style={{ fontSize: "16px", fontWeight: 400, WebkitFontSmoothing: "antialiased" }}>{eventInfo.subtitle}</p>
            </div>
          </div>
          <div className="relative z-10 mt-4 md:mt-5 h-10 rounded-[12px] border border-[#D8D0EA] flex items-center px-3 md:px-4 bg-white/95 shadow-[inset_0_0_0_1px_rgba(224,217,240,0.35)]">
            <Search className="w-4 h-4 text-[#6B6586] shrink-0" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索球员、球队、项目或结果"
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-full px-4 text-[#1F1A38] placeholder:text-[#7D759C]"
              style={{ fontSize: "15px", fontWeight: 400, WebkitFontSmoothing: "antialiased" }}
            />
            <button className="ml-2 h-8 w-16 rounded-[10px] bg-[#6D139B] hover:bg-[#5A0E86] text-white flex items-center justify-center shrink-0 shadow-[0_3px_8px_rgba(109,19,155,0.22)]" style={{ fontSize: "14px", fontWeight: 600 }}>
              搜索
            </button>
          </div>
          <div className="relative z-10 mt-3 flex flex-wrap items-center gap-2">
            {tab === "results" && (
              <>
                <FilterSelect
                  label="月份"
                  value={matchMonth}
                  onChange={(value) => {
                    setMatchMonth(value);
                    setMatchDate("");
                  }}
                  options={filterOptions.match_months.map((value) => ({ value, label: value }))}
                  placeholder="全部月份"
                />
                <FilterSelect
                  label="比赛日期"
                  value={matchDate}
                  onChange={setMatchDate}
                  options={filterOptions.match_dates.map((value) => ({
                    value,
                    label: formatDate(value),
                  }))}
                  placeholder="全部日期"
                />
              </>
            )}
            <TeamFilterInput
              teams={filterOptions.teams}
              value={teamId}
              onChange={setTeamId}
            />
            {tab === "results" && (
              <FilterSelect
                label="年龄组"
                value={ageGroup}
                onChange={setAgeGroup}
                options={filterOptions.age_groups.map((value) => ({ value, label: value }))}
                placeholder="全部年龄组"
              />
            )}
            <button
              onClick={resetFilters}
              className="h-9 rounded-[10px] border border-[#D8D0EA] bg-white/95 px-4 text-[#6B6586] hover:bg-[#F7F4FD]"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              重置
            </button>
          </div>
          <ImageWithFallback
            src={headerSwoosh}
            alt=""
            className="hidden md:block absolute right-5 top-0 max-h-full w-auto object-contain object-right-top pointer-events-none opacity-70"
          />
          <ImageWithFallback
            src={headerSwoosh}
            alt=""
            className="md:hidden absolute right-4 top-0 max-h-full w-auto object-contain object-right-top pointer-events-none opacity-70"
          />
        </div>

        <div className="bg-white rounded-[18px] md:rounded-[20px] shadow-[0_10px_26px_rgba(82,65,132,0.08)] p-4 md:p-5">
          {/* Tabs */}
          <div className="rounded-[12px] border border-[#DCD5ED] grid grid-cols-3 overflow-visible mb-4 md:mb-5">
            <TabBtn active={tab === "results"} nextActive={tab === "teams"} onClick={() => setTab("results")} label="比赛结果" icon={Trophy} />
            <TabBtn active={tab === "teams"} nextActive={tab === "players"} onClick={() => setTab("teams")} label="球队排名" icon={Users} />
            <TabBtn active={tab === "players"} onClick={() => setTab("players")} label="个人排名" icon={UserRound} />
          </div>

          {/* Content */}
          {error ? (
            <ErrorState onRetry={() => setReloadKey((value) => value + 1)} />
          ) : loading ? (
            <LoadingState />
          ) : tab === "results" ? (
            <ResultsPanel data={results} hasActiveFilters={hasActiveFilters} onReset={resetFilters} />
          ) : tab === "teams" ? (
            <TeamRankingPanel data={teamRankings} hasActiveFilters={hasActiveFilters} onReset={resetFilters} />
          ) : tab === "players" ? (
            <PlayerRankingPanel data={playerRankings} hasActiveFilters={hasActiveFilters} onReset={resetFilters} />
          ) : null}
        </div>

        <div className="flex items-center justify-center gap-2 text-[#9B95B5] pt-2" style={{ fontSize: "16px", fontWeight: 600 }}>
          <PurpleTennisLogo />
          <span>北京市活力网球交流系列赛</span>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  nextActive = false,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  nextActive?: boolean;
  onClick: () => void;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "relative h-14 md:h-16 flex items-center justify-center gap-3 transition " +
        (!active && !nextActive ? "border-r border-[#DCD5ED] last:border-r-0 " : "") +
        (active ? "z-10 bg-[#6D139B] text-white rounded-[10px] shadow-[0_8px_16px_rgba(109,19,155,0.2)]" : "text-[#241B44] hover:bg-[#F7F4FD]")
      }
      style={{ fontSize: "22px", fontWeight: 600, WebkitFontSmoothing: "antialiased" }}
    >
      <Icon className="w-6 h-6" />
      <span>{label}</span>
      {active && (
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-r-[9px] border-t-[10px] border-l-transparent border-r-transparent border-t-[#6D139B]" />
      )}
    </button>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  empty,
  hasActiveFilters = false,
  onReset,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  empty?: boolean;
  hasActiveFilters?: boolean;
  onReset?: () => void;
}) {
  if (empty) {
    const titleText = hasActiveFilters ? "未找到相关结果" : "暂无数据";
    const descText = hasActiveFilters ? "请尝试更换关键词" : "请调整筛选条件或稍后查看";
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[176px] md:min-h-[188px] rounded-[14px] border border-[#E6DFF3] overflow-hidden">
        <ImageWithFallback
          src={emptyArtwork}
          alt=""
          className="w-24 h-20 md:w-28 md:h-24 object-cover object-center opacity-40 pointer-events-none"
        />
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#D7F114] text-[#151031]">
            <Icon className="w-3 h-3" />
          </span>
          <p className="text-[#6B6586]" style={{ fontSize: "16px", fontWeight: 600 }}>{titleText}</p>
        </div>
        <p className="text-[#9B95B5]" style={{ fontSize: "13px", fontWeight: 400 }}>{descText}</p>
        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="mt-3 rounded-[10px] border border-[#D8D0EA] bg-white px-4 py-2 text-[#6B6586] hover:bg-[#F7F4FD]"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            清空筛选
          </button>
        )}
      </div>
    );
  }
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#D7F114] text-[#151031]">
          <Icon className="w-4 h-4" />
        </span>
        <h3 className="text-[#151031]" style={{ fontSize: "24px", fontWeight: 600, WebkitFontSmoothing: "antialiased" }}>{title}</h3>
      </div>
      {children}
    </>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 rounded-[12px] border border-[#E7DFF7] bg-[#FBF9FF] px-4 py-3 md:grid-cols-3 md:px-6">
        {[0, 1, 2].map((item) => (
          <div key={item} className="mx-auto h-5 w-36 animate-pulse rounded-full bg-[#E9E1F6]" />
        ))}
      </div>
      <div className="overflow-hidden rounded-[12px] border border-[#E3DBF4] bg-white">
        <div className="h-12 bg-[#F4EFFD]" />
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="grid grid-cols-6 gap-4 border-t border-[#EAE3F4] px-5 py-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-5 animate-pulse rounded-full bg-[#F0ECF8]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[14px] border border-[#F1B7B7] bg-white px-5 py-8 text-center">
      <p className="text-[#A83232]" style={{ fontSize: "16px", fontWeight: 600 }}>数据加载失败</p>
      <p className="mt-1 text-[#9B6B6B]" style={{ fontSize: "13px", fontWeight: 400 }}>请刷新页面重试</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-[10px] bg-[#6D139B] px-4 py-2 text-white hover:bg-[#5A0E86]"
        style={{ fontSize: "13px", fontWeight: 600 }}
      >
        重新加载
      </button>
    </div>
  );
}

function PurpleTennisLogo() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F1EAFE] text-[#6D139B]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="#6D139B" />
        <path d="M5 9.5c4.8 1.4 8.8 5.4 10.2 10.2M8.8 3.7c1.4 4.8 5.4 8.8 10.2 10.2" stroke="#F2EEFA" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <label className="flex h-9 min-w-[138px] items-center rounded-[10px] border border-[#D8D0EA] bg-white/95 pl-3 pr-2 text-[#6B6586]">
      <span className="mr-2 shrink-0" style={{ fontSize: "12px", fontWeight: 500 }}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[#241B44] outline-none"
        style={{ fontSize: "13px", fontWeight: 500 }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function TeamFilterInput({
  teams,
  value,
  onChange,
}: {
  teams: PublicFilterOptions["teams"];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex h-9 min-w-[176px] items-center rounded-[10px] border border-[#D8D0EA] bg-white/95 pl-3 pr-2 text-[#6B6586]">
      <span className="mr-2 shrink-0" style={{ fontSize: "12px", fontWeight: 500 }}>球队</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[#241B44] outline-none"
        style={{ fontSize: "13px", fontWeight: 500 }}
      >
        <option value="">全部球队</option>
        {teams.map((team) => (
          <option key={team.id} value={String(team.id)}>{teamOptionLabel(team)}</option>
        ))}
      </select>
    </label>
  );
}

function teamOptionLabel(team: PublicFilterOptions["teams"][number]) {
  return team.short_name && team.short_name !== team.name
    ? `${team.short_name} / ${team.name}`
    : team.name;
}

function matchMeta(r: MatchResult) {
  return [r.court, r.age_group || r.group_name].filter(Boolean).join(" · ") || "—";
}

function updateDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${year}.${month}.${date}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${year}.${month}.${day}` : value;
}

function ListMetaBar({ items }: { items: React.ReactNode[] }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-2 rounded-[12px] border border-[#E7DFF7] bg-gradient-to-b from-white to-[#FBF9FF] px-4 py-3 text-[#7C6FA7] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:grid-cols-3 md:px-6">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-center gap-2 whitespace-nowrap"
          style={{ fontSize: "14px", fontWeight: 500, WebkitFontSmoothing: "antialiased" }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function ListTable({ children, minWidth = 900 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="hidden overflow-x-auto rounded-[12px] border border-[#E3DBF4] bg-white md:block">
      <table className="w-full" style={{ minWidth }}>{children}</table>
    </div>
  );
}

function TeamBadge({ name }: { name: string | null | undefined }) {
  const text = name || "未归属";
  const style = teamColorStyle(text);
  return (
    <span
      className={`inline-flex min-h-6 items-center justify-center rounded-[9px] border px-3 py-1 ${style.className}`}
      style={{ fontSize: "13px", fontWeight: 600, WebkitFontSmoothing: "antialiased" }}
    >
      {text}
    </span>
  );
}

function teamColorStyle(name: string) {
  if (name.includes("新赛道")) {
    return { className: "border-[#C7DBFF] bg-[#EAF2FF] text-[#1D5BBF]" };
  }
  if (name.includes("环保")) {
    return { className: "border-[#BFE8C9] bg-[#EAF8ED] text-[#16833A]" };
  }
  if (name.includes("人社")) {
    return { className: "border-[#F7D3A8] bg-[#FFF2E2] text-[#B65A00]" };
  }
  return { className: "border-[#DDD8E8] bg-[#F3F1F7] text-[#5A536F]" };
}

function ScorePill({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={
        "inline-flex min-w-[44px] items-center justify-center rounded-full px-3 py-0.5 " +
        (active ? "bg-[#E5C8F7] text-[#6D139B]" : "bg-[#F1E3FB] text-[#7A13B2]")
      }
      style={{ fontSize: active ? "15px" : "14px", fontWeight: active ? 700 : 600, fontVariantNumeric: "tabular-nums", WebkitFontSmoothing: "antialiased" }}
    >
      {children}
    </span>
  );
}

function ScoreVs({ a, b }: { a: number; b: number }) {
  return (
    <div className="inline-flex items-center gap-2">
      <ScorePill active={a > b}>{a}</ScorePill>
      <span className="text-[#8E82A9]" style={{ fontSize: "14px", fontWeight: 600 }}>:</span>
      <ScorePill active={b > a}>{b}</ScorePill>
    </div>
  );
}

function StatPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-w-[40px] items-center justify-center rounded-full bg-[#F1E3FB] px-3 py-0.5 text-[#7A13B2]" style={{ fontSize: "14px", fontWeight: 600, fontVariantNumeric: "tabular-nums", WebkitFontSmoothing: "antialiased" }}>
      {children}
    </span>
  );
}

function NetGamesPill({ value }: { value: number }) {
  const className =
    value > 0
      ? "bg-[#EAF8ED] text-[#16833A] border-[#BFE8C9]"
      : value < 0
        ? "bg-[#FFF2E2] text-[#B65A00] border-[#F7D3A8]"
        : "bg-[#F3F1F7] text-[#5A536F] border-[#DDD8E8]";
  return (
    <span className={`inline-flex min-w-[44px] items-center justify-center rounded-full border px-3 py-0.5 ${className}`} style={{ fontSize: "14px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
      {value > 0 ? `+${value}` : value}
    </span>
  );
}

function RankMedal({ n }: { n: number }) {
  if (n <= 3) {
    const colors = [
      "from-[#FFD94D] to-[#F7A600] text-white",
      "from-[#DCE4EB] to-[#9BA8B6] text-white",
      "from-[#E8A766] to-[#B95B16] text-white",
    ];
    return (
      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b ${colors[n - 1]} shadow-[0_3px_8px_rgba(60,43,110,0.12)]`} style={{ fontSize: "14px", fontWeight: 600, fontVariantNumeric: "tabular-nums", WebkitFontSmoothing: "antialiased" }}>
        {n}
      </span>
    );
  }
  return <span className="text-[#1F1A38]" style={{ fontSize: "14px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{n}</span>;
}

function RankAssetMedal({ n }: { n: number }) {
  const assets: Record<number, string> = {
    1: teamRank1,
    2: teamRank2,
    3: teamRank3,
  };
  const src = assets[n];
  if (!src) {
    return <RankMedal n={n} />;
  }
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center">
      <img src={src} alt={`第 ${n} 名`} className="h-9 w-9 object-contain" />
    </span>
  );
}

function OpponentChips({ values }: { values: string[] }) {
  if (values.length === 0) return <span className="text-[#9B95B5]">—</span>;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {values.map((value, index) => {
        const parts = value.split(" ");
        const result = parts[parts.length - 1] ?? "";
        const score = parts[parts.length - 2] ?? "";
        const opponent = parts.slice(0, -2).join(" ");
        return (
          <span key={`${value}-${index}`} className="inline-flex items-center overflow-hidden rounded-[9px] bg-[#F4EFFD] text-[#1F1A38]" style={{ fontSize: "14px", fontWeight: 500, WebkitFontSmoothing: "antialiased" }}>
            <span className="bg-[#EAD8FA] px-3 py-1 text-[#7A13B2]" style={{ fontWeight: 600 }}>{result}</span>
            <span className="px-3 py-1">{opponent} {score}</span>
          </span>
        );
      })}
    </div>
  );
}

function ResultsPanel({ data, hasActiveFilters, onReset }: { data: MatchResult[]; hasActiveFilters: boolean; onReset: () => void }) {
  if (data.length === 0) return <SectionCard title="比赛结果" icon={Trophy} empty hasActiveFilters={hasActiveFilters} onReset={onReset} />;
  const teamCount = new Set(data.flatMap(item => [item.team_a_id, item.team_b_id])).size;
  return (
    <>
      <ListMetaBar
        items={[
          <><CalendarDays className="h-5 w-5 text-[#7A13B2]" /> 共 {data.length} 场比赛</>,
          <><Users className="h-5 w-5 text-[#7A13B2]" /> {teamCount} 支球队</>,
          <><Clock3 className="h-5 w-5 text-[#7A13B2]" /> 更新时间 {updateDate()}</>,
        ]}
      />
      <ListTable minWidth={1040}>
          <thead className="bg-[#F4EFFD]">
            <tr className="text-[#151031]" style={{ fontSize: "14px" }}>
              <Th center>日期</Th><Th center>场地</Th><Th center>年龄组</Th><Th center>对阵</Th><Th center>比分</Th><Th center>胜方</Th>
            </tr>
          </thead>
          <tbody>
            {data.map(r => (
              <tr key={r.id} className="border-t border-[#EAE3F4] transition-colors hover:bg-[#FBF8FF]">
                <Td center muted>{formatDate(r.match_date)}</Td>
                <Td center muted>{r.court || "—"}</Td>
                <Td center muted>{r.age_group || r.group_name || "—"}</Td>
                <Td center>
                  <div className="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-3" style={{ fontSize: "15px", fontWeight: 600 }}>
                    <span className="text-right">{playerNamesInitials(r.team_a_players)}（{r.team_a_name}）</span>
                    <span className="text-center text-[#7A13B2]" style={{ fontWeight: 600 }}>VS</span>
                    <span className="text-left">{playerNamesInitials(r.team_b_players)}（{r.team_b_name}）</span>
                  </div>
                </Td>
                <Td center><ScoreVs a={r.team_a_score} b={r.team_b_score} /></Td>
                <Td center><TeamBadge name={r.winner_team_name} /></Td>
              </tr>
            ))}
          </tbody>
      </ListTable>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.map(r => (
          <div key={r.id} className="rounded-[14px] border border-[#EDE7FB] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#1F1A38]" style={{ fontSize: "14px", fontWeight: 500 }}>{formatDate(r.match_date)} · {r.item_name}</span>
              <ScoreVs a={r.team_a_score} b={r.team_b_score} />
            </div>
            <div className="text-[#4B4566]" style={{ fontSize: "14px", fontWeight: 600 }}>
              {playerNamesInitials(r.team_a_players)}（{r.team_a_name}）
            </div>
            <div className="text-center text-[#7A13B2]" style={{ fontSize: "13px", fontWeight: 700 }}>VS</div>
            <div className="text-[#4B4566]" style={{ fontSize: "14px", fontWeight: 600 }}>
              {playerNamesInitials(r.team_b_players)}（{r.team_b_name}）
            </div>
            <div className="text-[#9B95B5]" style={{ fontSize: "13px", fontWeight: 400 }}>{matchMeta(r)}</div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[#8E82A9]" style={{ fontSize: "13px", fontWeight: 500 }}>胜方</span>
                <TeamBadge name={r.winner_team_name} />
              </div>
              {r.note && <span className="text-[#9B95B5]" style={{ fontSize: "13px", fontWeight: 400 }}>{r.note}</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TeamRankingPanel({ data, hasActiveFilters, onReset }: { data: TeamRanking[]; hasActiveFilters: boolean; onReset: () => void }) {
  if (data.length === 0) return <SectionCard title="球队排名" icon={Users} empty hasActiveFilters={hasActiveFilters} onReset={onReset} />;
  return (
    <>
      <ListMetaBar
        items={[
          <><Users className="h-5 w-5 text-[#7A13B2]" /> 共 {data.length} 支球队</>,
          <><ListOrdered className="h-5 w-5 text-[#7A13B2]" /> 按团体胜场 / 胜盘 / 胜局 / 净胜局排序</>,
          <><Clock3 className="h-5 w-5 text-[#7A13B2]" /> 更新时间 {updateDate()}</>,
        ]}
      />
      <ListTable minWidth={980}>
          <thead className="bg-[#F4EFFD]">
            <tr className="text-[#151031]" style={{ fontSize: "14px" }}>
              <Th center>排名</Th><Th>球队</Th><Th center>团体战绩</Th><Th center>胜盘</Th><Th center>胜局</Th><Th center>净胜局</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((e) => (
              <tr key={e.team_id} className="border-t border-[#EAE3F4] transition-colors hover:bg-[#FBF8FF]">
                <Td center><RankAssetMedal n={e.rank} /></Td>
                <Td><TeamBadge name={e.team_name} /></Td>
                <Td center><StatPill>{e.duel_win_count}胜 {e.duel_loss_count}负</StatPill></Td>
                <Td center><StatPill>{e.set_win_count}</StatPill></Td>
                <Td center><StatPill>{e.games_for}</StatPill></Td>
                <Td center><NetGamesPill value={e.net_games} /></Td>
              </tr>
            ))}
          </tbody>
      </ListTable>
      <div className="mt-3 flex items-center gap-2 px-8 text-[#7C6FA7]" style={{ fontSize: "14px", fontWeight: 400 }}>
        <Info className="h-4 w-4" />
        <span>排序规则：优先按团体胜场，其次按胜盘数、胜局数、净胜局。</span>
      </div>
      <div className="md:hidden space-y-3">
        {data.map((e) => (
          <div key={e.team_id} className="rounded-[14px] border border-[#EDE7FB] p-4 flex items-center gap-4">
            <RankAssetMedal n={e.rank} />
            <div className="flex-1 min-w-0">
              <div className="text-[#1F1A38] truncate" style={{ fontSize: "14px", fontWeight: 500 }}>{e.team_name}</div>
              <div className="text-[#9B95B5]" style={{ fontSize: "13px", fontWeight: 400 }}>{e.duel_win_count}胜 {e.duel_loss_count}负</div>
            </div>
            <NetGamesPill value={e.net_games} />
          </div>
        ))}
      </div>
    </>
  );
}

function PlayerRankingPanel({ data, hasActiveFilters, onReset }: { data: PlayerRanking[]; hasActiveFilters: boolean; onReset: () => void }) {
  if (data.length === 0) return <SectionCard title="个人排名" icon={UserRound} empty hasActiveFilters={hasActiveFilters} onReset={onReset} />;
  return (
    <>
      <ListMetaBar
        items={[
          <><Users className="h-5 w-5 text-[#7A13B2]" /> 共 {data.length} 名球员</>,
          <><ListOrdered className="h-5 w-5 text-[#7A13B2]" /> 按胜盘 / 胜局 / 净胜局排序</>,
          <><Clock3 className="h-5 w-5 text-[#7A13B2]" /> 更新时间 {updateDate()}</>,
        ]}
      />
      <ListTable minWidth={920}>
          <thead className="bg-[#F4EFFD]">
            <tr className="text-[#151031]" style={{ fontSize: "14px" }}>
              <Th center>排名</Th><Th>球员</Th><Th center>所属队伍</Th><Th center>出场</Th><Th center>胜盘</Th><Th center>胜局</Th><Th center>净胜局</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((e) => (
              <tr key={e.player_id} className="border-t border-[#EAE3F4] transition-colors hover:bg-[#FBF8FF]">
                <Td center><RankAssetMedal n={e.rank} /></Td>
                <Td><span style={{ fontWeight: 600 }}>{nameToInitials(e.player_name)}</span></Td>
                <Td center><TeamBadge name={e.team_name} /></Td>
                <Td center><StatPill>{e.appearance_count}</StatPill></Td>
                <Td center><StatPill>{e.set_win_count}</StatPill></Td>
                <Td center><StatPill>{e.games_for}</StatPill></Td>
                <Td center><NetGamesPill value={e.net_games} /></Td>
              </tr>
            ))}
          </tbody>
      </ListTable>
      <div className="mt-3 flex items-center gap-2 px-8 text-[#7C6FA7]" style={{ fontSize: "14px", fontWeight: 400 }}>
        <Info className="h-4 w-4 text-[#7A13B2]" />
        <span>同排名表示并列，后续名次不跳号。</span>
      </div>
      <div className="md:hidden space-y-3">
        {data.map((e) => (
          <div key={e.player_id} className="rounded-[14px] border border-[#EDE7FB] p-4 flex items-center gap-4">
            <RankAssetMedal n={e.rank} />
            <div className="flex-1 min-w-0">
              <div className="text-[#1F1A38]" style={{ fontSize: "14px", fontWeight: 500 }}>{nameToInitials(e.player_name)}</div>
              <div className="mt-1"><TeamBadge name={e.team_name} /></div>
            </div>
            <NetGamesPill value={e.net_games} />
          </div>
        ))}
      </div>
    </>
  );
}

function Th({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return <th className={(center ? "text-center " : "text-left ") + "px-4 py-3.5"} style={{ fontSize: "14px", fontWeight: 600, WebkitFontSmoothing: "antialiased" }}>{children}</th>;
}
function Td({
  children,
  className = "",
  center = false,
  muted = false,
}: {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      className={(center ? "text-center " : "text-left ") + "px-4 py-3 " + (muted ? "text-[#7C6FA7] " : "text-[#1F1A38] ") + className}
      style={{ fontSize: muted ? "14px" : "15px", fontWeight: muted ? 400 : 500, WebkitFontSmoothing: "antialiased" }}
    >
      {children}
    </td>
  );
}
