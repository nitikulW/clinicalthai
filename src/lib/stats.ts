import { OPEN_STATUSES, PHASE_ORDER } from "./labels";
import { provinceTh } from "./provinces";
import { yearOf } from "./search";
import type { Site, Trial } from "./types";

export interface Bucket {
  key: string;
  label: string;
  value: number;
}

function topN(counts: Map<string, number>, n: number, labelFn: (k: string) => string = (k) => k): Bucket[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([key, value]) => ({ key, label: labelFn(key), value }));
}

function inc(m: Map<string, number>, k: string, by = 1) {
  m.set(k, (m.get(k) ?? 0) + by);
}

/** Phase bucket: trials without phase (observational, device, …) count as NA. */
export function phaseKeys(t: Trial): string[] {
  return t.phases.length ? t.phases : ["NA"];
}

/** Sponsor placeholders like "Research Site" or "Novartis Investigative Site 123" */
export function isGenericFacility(name: string): boolean {
  return /^(.*\b(research|investigative|investigational|clinical|study|local)\s+(site|sites|institution)\b.*|site\s*[\w-]*\d+.*|many locations|multiple locations|ไม่ระบุสถานที่)$/i.test(name.trim());
}

/**
 * Identity of a physical site. Generic placeholder names are split by
 * location so unrelated sponsors' "Research Site" entries are not merged.
 */
export function siteKey(s: Pick<Site, "facility" | "province" | "city" | "lat" | "lon">) {
  const name = s.facility.trim().toLowerCase();
  if (isGenericFacility(name)) {
    const where = s.lat != null && s.lon != null ? `${s.lat.toFixed(2)},${s.lon.toFixed(2)}` : s.city.toLowerCase();
    return `~generic|${s.province ?? ""}|${where}`;
  }
  return `${name}|${s.province ?? ""}`;
}

export function siteDisplayName(s: Pick<Site, "facility" | "city">) {
  return isGenericFacility(s.facility) ? `ศูนย์วิจัย (ไม่ระบุชื่อ)${s.city ? ` · ${s.city}` : ""}` : s.facility;
}

export interface Dashboard {
  total: number;
  open: number;
  industryShare: number;
  siteCount: number;
  provinceCount: number;
  startedThisYear: number;
  thisYear: number;
  medianEnrollment: number | null;
  byYear: Bucket[];
  byPhase: Bucket[];
  bySponsorClass: Bucket[];
  byStatus: Bucket[];
  byInterventionType: Bucket[];
  topConditions: Bucket[];
  topProvinces: Bucket[];
  topSponsors: Bucket[];
}

export function computeDashboard(trials: Trial[], labels: {
  phase: Record<string, string>;
  sponsorClass: Record<string, string>;
  status: Record<string, string>;
  intervention: Record<string, string>;
}): Dashboard {
  const thisYear = new Date().getFullYear();
  const years = new Map<string, number>();
  const phases = new Map<string, number>();
  const classes = new Map<string, number>();
  const statuses = new Map<string, number>();
  const intTypes = new Map<string, number>();
  const conditions = new Map<string, number>();
  const conditionLabel = new Map<string, string>();
  const provinces = new Map<string, number>();
  const sponsors = new Map<string, number>();
  const sites = new Set<string>();
  const enrollments: number[] = [];
  let open = 0;
  let industry = 0;
  let startedThisYear = 0;

  for (const t of trials) {
    if (OPEN_STATUSES.includes(t.status)) open++;
    if (t.sponsorClass === "INDUSTRY") industry++;
    const y = yearOf(t.startDate);
    if (y) {
      inc(years, String(y));
      if (y === thisYear) startedThisYear++;
    }
    for (const p of phaseKeys(t)) inc(phases, p);
    inc(classes, t.sponsorClass);
    inc(statuses, t.status);
    for (const it of new Set(t.interventions.map((i) => i.type))) inc(intTypes, it);
    for (const c of new Set(t.conditions.map((c) => c.trim()))) {
      const k = c.toLowerCase();
      inc(conditions, k);
      if (!conditionLabel.has(k)) conditionLabel.set(k, c);
    }
    for (const p of new Set(t.sites.map((s) => s.province ?? "?"))) inc(provinces, p);
    inc(sponsors, t.sponsor);
    for (const s of t.sites) sites.add(siteKey(s));
    if (t.enrollment) enrollments.push(t.enrollment);
  }

  enrollments.sort((a, b) => a - b);
  const firstYear = thisYear - 14;
  const byYear: Bucket[] = [];
  for (let y = firstYear; y <= thisYear + 1; y++) {
    byYear.push({ key: String(y), label: String(y + 543), value: years.get(String(y)) ?? 0 });
  }

  return {
    total: trials.length,
    open,
    industryShare: trials.length ? industry / trials.length : 0,
    siteCount: sites.size,
    provinceCount: [...provinces.keys()].filter((k) => k !== "?").length,
    startedThisYear,
    thisYear,
    medianEnrollment: enrollments.length ? enrollments[Math.floor(enrollments.length / 2)] : null,
    byYear,
    byPhase: PHASE_ORDER.map((p) => ({ key: p, label: labels.phase[p] ?? p, value: phases.get(p) ?? 0 })),
    bySponsorClass: topN(classes, 10, (k) => labels.sponsorClass[k] ?? k),
    byStatus: topN(statuses, 12, (k) => labels.status[k] ?? k),
    byInterventionType: topN(intTypes, 12, (k) => labels.intervention[k] ?? k),
    topConditions: topN(conditions, 15, (k) => conditionLabel.get(k) ?? k),
    topProvinces: topN(provinces, 15, (k) => (k === "?" ? "ไม่ระบุจังหวัด" : provinceTh(k))),
    topSponsors: topN(sponsors, 15),
  };
}

/* ------------------------------------------------------------------ */
/* Explorer tables                                                     */
/* ------------------------------------------------------------------ */

export interface SponsorRow {
  name: string;
  sponsorClass: string;
  trials: number;
  open: number;
  phase: Record<string, number>;
  topConditions: string[];
  sites: number;
  provinces: number;
  latestStart?: string;
}

export function sponsorTable(trials: Trial[]): SponsorRow[] {
  const map = new Map<string, { row: SponsorRow; conds: Map<string, number>; sites: Set<string>; provs: Set<string> }>();
  for (const t of trials) {
    let e = map.get(t.sponsor);
    if (!e) {
      e = {
        row: { name: t.sponsor, sponsorClass: t.sponsorClass, trials: 0, open: 0, phase: {}, topConditions: [], sites: 0, provinces: 0 },
        conds: new Map(),
        sites: new Set(),
        provs: new Set(),
      };
      map.set(t.sponsor, e);
    }
    const r = e.row;
    r.trials++;
    if (OPEN_STATUSES.includes(t.status)) r.open++;
    for (const p of phaseKeys(t)) r.phase[p] = (r.phase[p] ?? 0) + 1;
    for (const c of t.conditions) inc(e.conds, c);
    for (const s of t.sites) {
      e.sites.add(siteKey(s));
      if (s.province) e.provs.add(s.province);
    }
    if (t.startDate && (!r.latestStart || t.startDate > r.latestStart)) r.latestStart = t.startDate;
  }
  return [...map.values()]
    .map(({ row, conds, sites, provs }) => ({
      ...row,
      sites: sites.size,
      provinces: provs.size,
      topConditions: topN(conds, 3).map((b) => b.key),
    }))
    .sort((a, b) => b.trials - a.trials);
}

export interface SiteRow {
  facility: string;
  province: string | null;
  trials: number;
  open: number;
  industry: number;
  topSponsors: string[];
  lat?: number;
  lon?: number;
}

export function siteTable(trials: Trial[]): SiteRow[] {
  const map = new Map<string, { row: SiteRow; sponsors: Map<string, number> }>();
  for (const t of trials) {
    const seen = new Set<string>();
    for (const s of t.sites) {
      const k = siteKey(s);
      if (seen.has(k)) continue;
      seen.add(k);
      let e = map.get(k);
      if (!e) {
        e = {
          row: { facility: siteDisplayName(s), province: s.province, trials: 0, open: 0, industry: 0, topSponsors: [], lat: s.lat, lon: s.lon },
          sponsors: new Map(),
        };
        map.set(k, e);
      }
      e.row.trials++;
      if (OPEN_STATUSES.includes(t.status)) e.row.open++;
      if (t.sponsorClass === "INDUSTRY") e.row.industry++;
      inc(e.sponsors, t.sponsor);
      if (e.row.lat == null && s.lat != null) {
        e.row.lat = s.lat;
        e.row.lon = s.lon;
      }
    }
  }
  return [...map.values()]
    .map(({ row, sponsors }) => ({ ...row, topSponsors: topN(sponsors, 3).map((b) => b.key) }))
    .sort((a, b) => b.trials - a.trials);
}
