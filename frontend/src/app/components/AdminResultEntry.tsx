import { useEffect, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "./ui/button";
import { ResultForm } from "./ResultForm";
import { toast } from "sonner";
import {
  cancelUpload,
  confirmUpload,
  createResult,
  getUploadPreview,
  listItems,
  listPlayers,
  listTeams,
  uploadExcel,
} from "../api/admin";
import type { Item, Player, Team, UploadBatch, UploadPreviewRow } from "../types/api";

type EntryTab = "manual" | "excel";

export function AdminResultEntry({ onSaved }: { onSaved: () => void }) {
  const [tab, setTab] = useState<EntryTab>("manual");
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [batch, setBatch] = useState<UploadBatch | null>(null);
  const [preview, setPreview] = useState<UploadPreviewRow[] | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([listItems(), listPlayers({ page_size: 100 }), listTeams({ page_size: 100 })])
      .then(([itemData, playerRes, teamRes]) => {
        setItems(itemData);
        setPlayers(playerRes.data);
        setTeams(teamRes.data);
      })
      .catch(error => toast.error(error instanceof Error ? error.message : "基础数据加载失败"));
  }, []);

  const upload = async () => {
    if (!file) {
      toast.error("请先选择 Excel 文件");
      return;
    }
    setUploading(true);
    try {
      const nextBatch = await uploadExcel(file);
      const rows = await getUploadPreview(nextBatch.id);
      setBatch(nextBatch);
      setPreview(rows);
      toast.success("Excel 已解析");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Excel 解析失败");
    } finally {
      setUploading(false);
    }
  };

  const cancel = async () => {
    try {
      if (batch) await cancelUpload(batch.id);
    } catch {
      // 取消失败不阻塞前端清空当前预览。
    }
    setBatch(null);
    setPreview(null);
    setFile(null);
  };

  const confirm = async () => {
    if (!batch || !preview) return;
    const confirmedRows = preview.filter(row => row.row_status !== "error").map(row => row.row_number);
    try {
      const res = await confirmUpload(batch.id, confirmedRows);
      toast.success(`已导入 ${res.imported_count ?? confirmedRows.length} 条成绩`);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "确认导入失败");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[16px] border border-[#EDE7FB] p-1.5 inline-flex">
        <TabBtn active={tab === "manual"} onClick={() => setTab("manual")}>手工录入</TabBtn>
        <TabBtn active={tab === "excel"} onClick={() => setTab("excel")}>Excel 上传</TabBtn>
      </div>

      {tab === "manual" ? (
        <div className="bg-white rounded-[16px] border border-[#EDE7FB] p-5 md:p-6 max-w-2xl shadow-[0_2px_10px_rgba(109,63,224,0.04)]">
          <ResultForm
            items={items}
            players={players}
            teams={teams}
            onSubmit={async (v) => {
              try {
                await createResult(v);
                toast.success("成绩已保存");
                onSaved();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "保存失败");
              }
            }}
          />
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-white rounded-[16px] border border-dashed border-[#C9BEEC] p-8 text-center shadow-[0_2px_10px_rgba(109,63,224,0.04)]">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-[#6D3FE0]" />
            <div className="mt-3 text-[#1F1A38]" style={{ fontSize: "14px", fontWeight: 600 }}>上传 .xlsx 成绩文件</div>
            <div className="mt-1 text-[#9B95B5]" style={{ fontSize: "12px" }}>
              模板字段包含：比赛日期、场地、年龄组、双方球队、球员和比分
            </div>
            <label className="inline-flex items-center gap-2 mt-4 cursor-pointer">
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[10px] border border-[#E0D9F0] bg-white text-[#4B4566]" style={{ fontSize: "12px" }}>
                <Upload className="w-3.5 h-3.5" /> 选择文件
              </span>
              {file && <span className="text-[#6B6586]" style={{ fontSize: "12px" }}>{file.name}</span>}
            </label>
            <div className="mt-4">
              <Button
                disabled={uploading}
                onClick={upload}
                className="bg-[#6D3FE0] hover:bg-[#5C32CE] text-white"
              >
                {uploading ? "解析中..." : "上传并解析"}
              </Button>
            </div>
          </div>

          {preview && (
            <div className="bg-white rounded-[16px] border border-[#EDE7FB] overflow-hidden shadow-[0_2px_10px_rgba(109,63,224,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-[#F4EFFD]">
                    <tr className="text-[#4B2BB5]" style={{ fontSize: "12px" }}>
                      {["行号", "日期", "场地", "年龄组", "项目名称", "对阵", "比分", "胜方", "状态", "错误说明"].map(h => (
                        <th key={h} className="text-left px-4 py-3" style={{ fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map(row => {
                      const winner = row.team_a_score != null && row.team_b_score != null
                        ? row.team_a_score > row.team_b_score ? row.team_a_name : row.team_b_name
                        : "—";
                      return (
                        <tr key={row.row_number} className="border-t border-[#F0EAF9]" style={{ fontSize: "12px" }}>
                          <td className="px-4 py-2.5">{row.row_number}</td>
                          <td className="px-4 py-2.5">{formatDate(row.match_date)}</td>
                          <td className="px-4 py-2.5">{row.court || "—"}</td>
                          <td className="px-4 py-2.5">{row.age_group || row.group_name || "—"}</td>
                          <td className="px-4 py-2.5">{row.item_name || itemName(row.item_id ?? undefined)}</td>
                          <td className="px-4 py-2.5">
                            <div>{row.team_a_name || "A队"} vs {row.team_b_name || "B队"}</div>
                            <div className="text-[#9B95B5] mt-1">
                              {(row.team_a_player_names ?? []).join(" / ") || "—"} / {(row.team_b_player_names ?? []).join(" / ") || "—"}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">{row.score_text || "—"}</td>
                          <td className="px-4 py-2.5 text-[#5DBE3B]" style={{ fontWeight: 700 }}>{winner}</td>
                          <td className="px-4 py-2.5">
                            <span className={"rounded-full px-2 py-0.5 " + (row.row_status !== "error" ? "bg-[#E7F8DE] text-[#3F8B26]" : "bg-[#FCE4E4] text-[#C03A3A]")} style={{ fontSize: "11px", fontWeight: 600 }}>
                              {row.row_status !== "error" ? "正常" : "错误"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-[#C03A3A]">{row.error_message || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t border-[#EDE7FB] bg-[#FAF8FE]">
                <Button variant="outline" onClick={cancel}>取消上传</Button>
                <Button onClick={confirm} className="bg-[#6D3FE0] hover:bg-[#5C32CE] text-white">确认导入</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  function itemName(itemId?: number) {
    return items.find(item => item.id === itemId)?.name ?? "—";
  }

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

function formatDate(value?: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${year}.${month}.${day}` : value;
}
