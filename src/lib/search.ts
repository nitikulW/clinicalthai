import { OPEN_STATUSES } from "./labels";
import { provinceByEn } from "./provinces";
import { expandQuery } from "./thai-terms";
import type { Trial } from "./types";

/* ------------------------------------------------------------------ */
/* Text matching                                                       */
/* ------------------------------------------------------------------ */

const hayCache = new WeakMap<Trial, string>();

function haystack(t: Trial): string {
  let h = hayCache.get(t);
  if (!h) {
    h = [
      t.id,
      t.title,
      t.officialTitle,
      t.acronym,
      t.conditions.join(" | "),
      t.keywords.join(" | "),
      t.interventions.map((i) => i.name).join(" | "),
      t.sponsor,
      t.collaborators.join(" | "),
      t.summary,
    ]
      .filter(Boolean)
      .join(" \n ")
      .toLowerCase();
    hayCache.set(t, h);
  }
  return h;
}

const reCache = new Map<string, RegExp>();
function termRegex(term: string): RegExp {
  let re = reCache.get(term);
  if (!re) {
    const esc = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Short terms (acronyms) must be whole words; longer ones may be word prefixes (stems).
    re = new RegExp(term.length <= 4 ? `\\b${esc}\\b` : `\\b${esc}`);
    reCache.set(term, re);
  }
  return re;
}

/** Match a lower-cased text against expanded query concepts. */
export function textMatches(h: string, concepts: string[][]): boolean {
  return concepts.every((alts) => alts.some((term) => termRegex(term).test(h)));
}

export function matchesConcepts(t: Trial, concepts: string[][]): boolean {
  if (!concepts.length) return true;
  return textMatches(haystack(t), concepts);
}

/* ------------------------------------------------------------------ */
/* Filtering                                                           */
/* ------------------------------------------------------------------ */

export interface TrialFilter {
  q?: string;
  province?: string;
  region?: string;
  /** "open" = recruiting + not yet recruiting; "all"; or a specific status */
  status?: string;
  age?: number;
  sex?: "MALE" | "FEMALE";
  healthy?: boolean;
  phase?: string;
  studyType?: string;
  sponsorClass?: string;
  sponsor?: string;
  interventionType?: string;
  yearFrom?: number;
  yearTo?: number;
  facility?: string;
}

export const yearOf = (d?: string) => (d ? Number(d.slice(0, 4)) : undefined);

export function filterTrials(trials: Trial[], f: TrialFilter): Trial[] {
  const concepts = expandQuery(f.q ?? "");
  const sponsorQ = f.sponsor?.toLowerCase();
  const facilityQ = f.facility?.toLowerCase();
  return trials.filter((t) => {
    if (f.status === "open" || f.status === undefined) {
      if (!OPEN_STATUSES.includes(t.status)) return false;
    } else if (f.status !== "all" && t.status !== f.status) return false;
    if (f.province && !t.sites.some((s) => s.province === f.province)) return false;
    if (f.region && !t.sites.some((s) => provinceByEn(s.province)?.region === f.region)) return false;
    if (f.age != null && !ageOk(t, f.age)) return false;
    if (f.sex && t.sex !== "ALL" && t.sex !== f.sex) return false;
    if (f.healthy && !t.healthyVolunteers) return false;
    if (f.phase && !(f.phase === "NA" ? t.phases.length === 0 || t.phases.includes("NA") : t.phases.includes(f.phase)))
      return false;
    if (f.studyType && t.studyType !== f.studyType) return false;
    if (f.sponsorClass && t.sponsorClass !== f.sponsorClass) return false;
    if (sponsorQ && !t.sponsor.toLowerCase().includes(sponsorQ)) return false;
    if (facilityQ && !t.sites.some((s) => s.facility.toLowerCase().includes(facilityQ))) return false;
    if (f.interventionType && !t.interventions.some((i) => i.type === f.interventionType)) return false;
    if (f.yearFrom || f.yearTo) {
      const y = yearOf(t.startDate);
      if (!y) return false;
      if (f.yearFrom && y < f.yearFrom) return false;
      if (f.yearTo && y > f.yearTo) return false;
    }
    return matchesConcepts(t, concepts);
  });
}

export function ageOk(t: Trial, age: number): boolean {
  if (t.minAge != null && age < t.minAge) return false;
  if (t.maxAge != null && age > t.maxAge) return false;
  return true;
}

export type SortKey = "recent" | "updated" | "enrollment" | "start";

export function sortTrials(list: Trial[], key: SortKey = "recent"): Trial[] {
  const by = (fn: (t: Trial) => string | number | undefined) =>
    [...list].sort((a, b) => {
      const va = fn(a) ?? "";
      const vb = fn(b) ?? "";
      return va < vb ? 1 : va > vb ? -1 : 0;
    });
  switch (key) {
    case "updated":
      return by((t) => t.lastUpdated);
    case "enrollment":
      return by((t) => t.enrollment ?? 0);
    case "start":
      return by((t) => t.startDate);
    default:
      // recruiting first, then newest posted
      return [...list].sort(
        (a, b) =>
          Number(b.status === "RECRUITING") - Number(a.status === "RECRUITING") ||
          (b.firstPosted ?? "").localeCompare(a.firstPosted ?? ""),
      );
  }
}

/* ------------------------------------------------------------------ */
/* Pre-screening match                                                 */
/* ------------------------------------------------------------------ */

export interface ScreenAnswers {
  age: number;
  sex: "MALE" | "FEMALE";
  province?: string;
  /** "province" | "region" | "anywhere" */
  travel: "province" | "region" | "anywhere";
  conditions: string[];
  otherCondition?: string;
  healthyWilling: boolean;
}

export interface MatchResult {
  trial: Trial;
  score: number;
  reasons: string[];
  /** Sites closest to the user (same province first) */
  nearSites: string[];
}

export function screenMatch(trials: Trial[], a: ScreenAnswers): MatchResult[] {
  const condConcepts = [...a.conditions, a.otherCondition ?? ""]
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => ({ label: c, concepts: expandQuery(c) }))
    .filter((c) => c.concepts.length);
  const home = provinceByEn(a.province);
  const out: MatchResult[] = [];

  for (const t of trials) {
    if (!OPEN_STATUSES.includes(t.status)) continue;
    if (!ageOk(t, a.age)) continue;
    if (t.sex !== "ALL" && t.sex !== a.sex) continue;

    const reasons: string[] = [];
    let score = 0;

    const matchedConds = condConcepts.filter((c) => matchesConcepts(t, c.concepts)).map((c) => c.label);
    if (matchedConds.length) {
      score += 50 + 5 * matchedConds.length;
      reasons.push(`เกี่ยวกับ ${matchedConds.join(", ")}`);
    } else if (a.healthyWilling && t.healthyVolunteers) {
      score += 30;
      reasons.push("รับอาสาสมัครสุขภาพดี");
    } else {
      continue;
    }

    // Location
    const inProvince = home ? t.sites.filter((s) => s.province === home.en) : [];
    const inRegion = home ? t.sites.filter((s) => provinceByEn(s.province)?.region === home.region) : [];
    if (home) {
      if (inProvince.length) {
        score += 30;
        reasons.push(`มีศูนย์วิจัยใน${home.th}`);
      } else if (inRegion.length) {
        if (a.travel === "province") continue;
        score += 15;
        reasons.push("มีศูนย์วิจัยในภาคเดียวกัน");
      } else if (a.travel !== "anywhere") continue;
    }

    reasons.push(ageReason(t));
    if (t.status === "RECRUITING") score += 5;

    const near = (inProvince.length ? inProvince : inRegion.length ? inRegion : t.sites).slice(0, 3);
    out.push({ trial: t, score, reasons, nearSites: near.map((s) => s.facility) });
  }
  return out.sort((x, y) => y.score - x.score);
}

function ageReason(t: Trial): string {
  return ageRangeTh(t.minAge, t.maxAge);
}

/** 18 → "18 ปี", 0.5 → "6 เดือน" */
export function fmtAge(n: number): string {
  if (n < 1) return `${Math.max(1, Math.round(n * 12))} เดือน`;
  return `${Number.isInteger(n) ? n : n.toFixed(1)} ปี`;
}

export function ageRangeTh(min?: number, max?: number): string {
  if (min != null && max != null) return `อายุ ${fmtAge(min)} – ${fmtAge(max)}`;
  if (min != null) return `อายุ ${fmtAge(min)} ขึ้นไป`;
  if (max != null) return `อายุไม่เกิน ${fmtAge(max)}`;
  return "ไม่จำกัดอายุ";
}
