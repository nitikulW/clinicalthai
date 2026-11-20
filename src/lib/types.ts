export interface Site {
  facility: string;
  city: string;
  state: string;
  /** Province key (English name in PROVINCES), null when unknown */
  province: string | null;
  status?: string;
  lat?: number;
  lon?: number;
}

export interface Intervention {
  type: string;
  name: string;
}

/** Compact trial record kept in the cache (Thai sites only). */
export interface Trial {
  id: string;
  title: string;
  officialTitle?: string;
  acronym?: string;
  status: string;
  studyType: string;
  phases: string[];
  conditions: string[];
  keywords: string[];
  interventions: Intervention[];
  sponsor: string;
  sponsorClass: string;
  collaborators: string[];
  enrollment?: number;
  startDate?: string;
  completionDate?: string;
  firstPosted?: string;
  lastUpdated?: string;
  healthyVolunteers: boolean;
  sex: "ALL" | "MALE" | "FEMALE";
  /** Ages in years (fractional allowed) */
  minAge?: number;
  maxAge?: number;
  minAgeText?: string;
  maxAgeText?: string;
  summary?: string;
  sites: Site[];
}

export interface Contact {
  name?: string;
  role?: string;
  phone?: string;
  phoneExt?: string;
  email?: string;
}

export interface SiteDetail extends Site {
  contacts: Contact[];
}

/** Full record fetched on demand for the detail page. */
export interface TrialDetail extends Omit<Trial, "sites"> {
  detailedDescription?: string;
  eligibilityCriteria?: string;
  centralContacts: Contact[];
  arms: { label: string; type?: string; description?: string }[];
  primaryOutcomes: { measure: string; timeFrame?: string }[];
  sites: SiteDetail[];
  otherCountries: string[];
}

export interface Dataset {
  fetchedAt: string;
  trials: Trial[];
}
