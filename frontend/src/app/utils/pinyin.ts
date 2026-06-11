import { pinyin } from "pinyin-pro";

export function nameToInitials(name: string): string {
  if (!name) return "—";
  const initials = pinyin(name, { pattern: "first", toneType: "none" });
  return initials.toUpperCase();
}

export function playerNamesInitials(players: { name: string }[]): string {
  return players.map(p => nameToInitials(p.name)).join(" / ") || "—";
}