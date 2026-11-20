import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveProvince } from "./provinces";
import type { Contact, Dataset, SiteDetail, Trial, TrialDetail } from "./types";

/**
 * ClinicalTrials.gov API v2 client.
 * Docs: https://clinicaltrials.gov/data-api/api
 *
 * The full Thai dataset (~4–5k studies) is fetched in pages of 1000 and kept
 * in memory plus a JSON snapshot on disk, refreshed every CACHE_TTL_HOURS.
 */

const API = "https://clinicaltrials.gov/api/v2/studies";
// Snapshot bundled at build time (read-only on serverless) and a writable
// runtime copy (/tmp on Vercel, ./.cache locally).
const BUNDLED_SNAPSHOT = path.join(process.cwd(), ".cache", "trials.json");
const CACHE_DIR = process.env.VERCEL ? path.join(os.tmpdir(), "clinicalthai") : path.join(process.cwd(), ".cache");
const SNAPSHOT = path.join(CACHE_DIR, "trials.json");
const TTL_MS = Number(process.env.CACHE_TTL_HOURS ?? 12) * 3600_000;

const LIST_FIELDS = [
  "NCTId", "BriefTitle", "OfficialTitle", "Acronym", "OverallStatus", "StudyType", "Phase",
  "Condition", "Keyword", "InterventionType", "InterventionName", "LeadSponsorName", "LeadSponsorClass",
  "CollaboratorName", "EnrollmentCount", "StartDate", "PrimaryCompletionDate", "StudyFirstPostDate",
  "LastUpdatePostDate", "HealthyVolunteers", "Sex", "MinimumAge", "MaximumAge", "BriefSummary",
  "LocationFacility", "LocationCity", "LocationState", "LocationCountry", "LocationStatus", "LocationGeoPoint",
].join("|");

/* ------------------------------------------------------------------ */
/* Raw API shapes (only the parts we read)                             */
/* ------------------------------------------------------------------ */

interface RawLocation {
  facility?: string;
  status?: string;
  city?: string;
  state?: string;
  country?: string;
  geoPoint?: { lat: number; lon: number };
  contacts?: Contact[];
}

interface RawStudy {
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string; officialTitle?: string; acronym?: string };
    statusModule?: {
      overallStatus?: string;
      startDateStruct?: { date?: string };
      primaryCompletionDateStruct?: { date?: string };
      studyFirstPostDateStruct?: { date?: string };
      lastUpdatePostDateStruct?: { date?: string };
    };
    sponsorCollaboratorsModule?: {
      leadSponsor?: { name?: string; class?: string };
      collaborators?: { name?: string }[];
    };
    descriptionModule?: { briefSummary?: string; detailedDescription?: string };
    conditionsModule?: { conditions?: string[]; keywords?: string[] };
    designModule?: { studyType?: string; phases?: string[]; enrollmentInfo?: { count?: number } };
    armsInterventionsModule?: {
      interventions?: { type?: string; name?: string }[];
      armGroups?: { label?: string; type?: string; description?: string }[];
    };
    outcomesModule?: { primaryOutcomes?: { measure?: string; timeFrame?: string }[] };
    eligibilityModule?: {
      eligibilityCriteria?: string;
      healthyVolunteers?: boolean;
      sex?: string;
      minimumAge?: string;
      maximumAge?: string;
    };
    contactsLocationsModule?: { centralContacts?: Contact[]; locations?: RawLocation[] };
  };
}

interface RawPage {
  studies: RawStudy[];
  nextPageToken?: string;
  totalCount?: number;
}

/* ------------------------------------------------------------------ */
/* Normalization                                                       */
/* ------------------------------------------------------------------ */

/** "18 Years" → 18, "6 Months" → 0.5 */
export function parseAge(s?: string): number | undefined {
  if (!s) return undefined;
  const m = s.match(/([\d.]+)\s*(year|month|week|day|hour|minute)/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const div: Record<string, number> = { year: 1, month: 12, week: 52, day: 365, hour: 8760, minute: 525600 };
  return n / div[unit];
}

function isThai(l: RawLocation) {
  return (l.country ?? "").toLowerCase() === "thailand";
}

function normalize(s: RawStudy): Trial | null {
  const p = s.protocolSection;
  const id = p?.identificationModule?.nctId;
  if (!p || !id) return null;
  const elig = p.eligibilityModule ?? {};
  const sites = (p.contactsLocationsModule?.locations ?? []).filter(isThai).map((l) => ({
    facility: (l.facility ?? "").trim() || "ไม่ระบุสถานที่",
    city: l.city ?? "",
    state: l.state ?? "",
    status: l.status,
    lat: l.geoPoint?.lat,
    lon: l.geoPoint?.lon,
    province: resolveProvince(l.city, l.state, l.geoPoint?.lat, l.geoPoint?.lon, l.facility),
  }));
  if (sites.length === 0) return null; // query.locn can match non-location text
  const sex = (elig.sex ?? "ALL").toUpperCase();
  return {
    id,
    title: p.identificationModule?.briefTitle ?? id,
    officialTitle: p.identificationModule?.officialTitle,
    acronym: p.identificationModule?.acronym,
    status: p.statusModule?.overallStatus ?? "UNKNOWN",
    studyType: p.designModule?.studyType ?? "UNKNOWN",
    phases: p.designModule?.phases ?? [],
    conditions: p.conditionsModule?.conditions ?? [],
    keywords: p.conditionsModule?.keywords ?? [],
    interventions: (p.armsInterventionsModule?.interventions ?? []).map((i) => ({
      type: i.type ?? "OTHER",
      name: i.name ?? "",
    })),
    sponsor: p.sponsorCollaboratorsModule?.leadSponsor?.name ?? "ไม่ระบุ",
    sponsorClass: p.sponsorCollaboratorsModule?.leadSponsor?.class ?? "UNKNOWN",
    collaborators: (p.sponsorCollaboratorsModule?.collaborators ?? []).map((c) => c.name ?? "").filter(Boolean),
    enrollment: p.designModule?.enrollmentInfo?.count,
    startDate: p.statusModule?.startDateStruct?.date,
    completionDate: p.statusModule?.primaryCompletionDateStruct?.date,
    firstPosted: p.statusModule?.studyFirstPostDateStruct?.date,
    lastUpdated: p.statusModule?.lastUpdatePostDateStruct?.date,
    healthyVolunteers: Boolean(elig.healthyVolunteers),
    sex: sex === "MALE" || sex === "FEMALE" ? sex : "ALL",
    minAge: parseAge(elig.minimumAge),
    maxAge: parseAge(elig.maximumAge),
    minAgeText: elig.minimumAge,
    maxAgeText: elig.maximumAge,
    summary: p.descriptionModule?.briefSummary,
    sites,
  };
}

/* ------------------------------------------------------------------ */
/* Fetching                                                            */
/* ------------------------------------------------------------------ */

async function getJson<T>(url: string, attempt = 1): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!res.ok) {
    if (attempt < 3 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return getJson<T>(url, attempt + 1);
    }
    throw new Error(`ClinicalTrials.gov ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function fetchAllThaiTrials(): Promise<Dataset> {
  const trials: Trial[] = [];
  let token: string | undefined;
  do {
    const params = new URLSearchParams({ "query.locn": "Thailand", pageSize: "1000", fields: LIST_FIELDS });
    if (token) params.set("pageToken", token);
    const page = await getJson<RawPage>(`${API}?${params}`);
    for (const s of page.studies) {
      const t = normalize(s);
      if (t) trials.push(t);
    }
    token = page.nextPageToken;
  } while (token);
  return { fetchedAt: new Date().toISOString(), trials };
}

/* ------------------------------------------------------------------ */
/* Cache                                                               */
/* ------------------------------------------------------------------ */

const g = globalThis as unknown as { __ctgov?: { data?: Dataset; inflight?: Promise<Dataset> } };
const mem = (g.__ctgov ??= {});

async function readSnapshot(): Promise<Dataset | undefined> {
  let best: Dataset | undefined;
  for (const file of [SNAPSHOT, BUNDLED_SNAPSHOT]) {
    try {
      const d = JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ file, "utf8")) as Dataset;
      if (!best || d.fetchedAt > best.fetchedAt) best = d;
    } catch {
      // missing — try the next one
    }
  }
  return best;
}

async function writeSnapshot(d: Dataset) {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(SNAPSHOT, JSON.stringify(d));
  } catch {
    // read-only filesystem (e.g. serverless) — memory cache still works
  }
}

const isFresh = (d?: Dataset) => !!d && Date.now() - new Date(d.fetchedAt).getTime() < TTL_MS;

async function refresh(): Promise<Dataset> {
  mem.inflight ??= fetchAllThaiTrials()
    .then(async (d) => {
      mem.data = d;
      await writeSnapshot(d);
      return d;
    })
    .finally(() => {
      mem.inflight = undefined;
    });
  return mem.inflight;
}

/**
 * Returns the cached dataset. Stale data is served immediately while a
 * background refresh runs; only a cold start without a snapshot waits.
 */
export async function getDataset(opts: { force?: boolean } = {}): Promise<Dataset> {
  if (opts.force) return refresh();
  if (isFresh(mem.data)) return mem.data!;
  if (!mem.data) mem.data = await readSnapshot();
  if (mem.data) {
    if (!isFresh(mem.data)) refresh().catch((e) => console.error("[ctgov] refresh failed", e));
    return mem.data;
  }
  return refresh();
}

export async function getTrials(): Promise<Trial[]> {
  return (await getDataset()).trials;
}

/* ------------------------------------------------------------------ */
/* Single study detail                                                 */
/* ------------------------------------------------------------------ */

const detailCache = new Map<string, { at: number; data: TrialDetail | null }>();

export async function getTrialDetail(id: string): Promise<TrialDetail | null> {
  if (!/^NCT\d{8}$/.test(id)) return null;
  const hit = detailCache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  let raw: RawStudy;
  try {
    raw = await getJson<RawStudy>(`${API}/${id}?format=json`);
  } catch (e) {
    if (/ (400|404) /.test(String(e))) {
      detailCache.set(id, { at: Date.now(), data: null });
      return null;
    }
    throw e;
  }
  const base = normalize(raw);
  const p = raw.protocolSection!;
  const locations = p.contactsLocationsModule?.locations ?? [];
  const detail: TrialDetail | null = base && {
    ...base,
    detailedDescription: p.descriptionModule?.detailedDescription,
    eligibilityCriteria: p.eligibilityModule?.eligibilityCriteria,
    centralContacts: p.contactsLocationsModule?.centralContacts ?? [],
    arms: (p.armsInterventionsModule?.armGroups ?? []).map((a) => ({
      label: a.label ?? "",
      type: a.type,
      description: a.description,
    })),
    primaryOutcomes: (p.outcomesModule?.primaryOutcomes ?? []).map((o) => ({
      measure: o.measure ?? "",
      timeFrame: o.timeFrame,
    })),
    sites: locations.filter(isThai).map(
      (l): SiteDetail => ({
        facility: (l.facility ?? "").trim() || "ไม่ระบุสถานที่",
        city: l.city ?? "",
        state: l.state ?? "",
        status: l.status,
        lat: l.geoPoint?.lat,
        lon: l.geoPoint?.lon,
        province: resolveProvince(l.city, l.state, l.geoPoint?.lat, l.geoPoint?.lon, l.facility),
        contacts: l.contacts ?? [],
      }),
    ),
    otherCountries: [...new Set(locations.filter((l) => !isThai(l)).map((l) => l.country ?? ""))].filter(Boolean).sort(),
  };
  detailCache.set(id, { at: Date.now(), data: detail });
  return detail;
}
