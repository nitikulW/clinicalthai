import type { SortKey, TrialFilter } from "./search";

export type SP = Record<string, string | string[] | undefined>;

export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

const int = (v?: string) => {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

export function parseFilter(sp: SP, defaults: Partial<TrialFilter> = {}): TrialFilter {
  const sex = one(sp.sex);
  return {
    ...defaults,
    q: one(sp.q),
    province: one(sp.province),
    region: one(sp.region),
    status: one(sp.status) ?? defaults.status,
    age: int(one(sp.age)),
    sex: sex === "MALE" || sex === "FEMALE" ? sex : undefined,
    healthy: one(sp.healthy) === "1",
    phase: one(sp.phase),
    studyType: one(sp.studyType),
    sponsorClass: one(sp.sponsorClass),
    sponsor: one(sp.sponsor),
    interventionType: one(sp.interventionType),
    yearFrom: int(one(sp.yearFrom)),
    yearTo: int(one(sp.yearTo)),
    facility: one(sp.facility),
  };
}

export function parseSort(sp: SP): SortKey {
  const s = one(sp.sort);
  return s === "updated" || s === "enrollment" || s === "start" ? s : "recent";
}

/** Build a query string, dropping empty values. */
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === false) continue;
    u.set(k, v === true ? "1" : String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}

export function spToRecord(sp: SP): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const val = one(v);
    if (val) out[k] = val;
  }
  return out;
}
