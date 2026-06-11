import type { ReactNode } from "react";

export function Toolbar({ search, searchIcon, right }: { search: ReactNode; searchIcon?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="relative flex-1 max-w-md">
        {searchIcon}
        {search}
      </div>
      <div className="sm:ml-auto">{right}</div>
    </div>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 " +
        (active ? "bg-[#E7F8DE] text-[#3F8B26]" : "bg-[#EDEAF7] text-[#6B6586]")
      }
      style={{ fontSize: "11px", fontWeight: 600 }}
    >
      {active ? "有效" : "停用"}
    </span>
  );
}

export function AdminTable({ head, rows, empty }: { head: ReactNode[]; rows: ReactNode[][]; empty?: string }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#EDE7FB] overflow-hidden shadow-[0_2px_10px_rgba(109,63,224,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-[#F4EFFD]">
            <tr className="text-[#4B2BB5]" style={{ fontSize: "12px" }}>
              {head.map((h, i) => (
                <th key={i} className="text-left px-4 py-3" style={{ fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={head.length} className="text-center text-[#9B95B5] py-10" style={{ fontSize: "13px" }}>{empty ?? "暂无数据"}</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="border-t border-[#F0EAF9]">
                {r.map((c, j) => <td key={j} className="px-4 py-3 text-[#1F1A38]" style={{ fontSize: "13px" }}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
