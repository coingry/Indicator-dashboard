// utils/time.ts
import type { Time, BusinessDay } from "lightweight-charts";

export function timeToDate(t: Time): Date {
  if (typeof t === "number") return new Date(t * 1000);
  const bd = t as BusinessDay;
  return new Date(Date.UTC(bd.year, bd.month - 1, bd.day));
}

export function formatKST(t: Time): string {
  const d = timeToDate(t);
  const kst = new Date(d.getTime() + 9 * 3600 * 1000);
  return kst.toISOString().replace("T", " ").slice(0, 16);
}