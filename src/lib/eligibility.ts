export interface ParsedCriteria {
  inclusion: string[];
  exclusion: string[];
  /** Text that could not be split into the two lists */
  other: string[];
}

/**
 * Split ClinicalTrials.gov free-text eligibility into inclusion/exclusion
 * bullet lists. The source is markdown-ish ("Inclusion Criteria:\n\n* ...").
 */
export function parseCriteria(text?: string): ParsedCriteria {
  const out: ParsedCriteria = { inclusion: [], exclusion: [], other: [] };
  if (!text) return out;
  let bucket: keyof ParsedCriteria = "other";
  let current: string | null = null;

  const flush = () => {
    if (current && current.trim()) out[bucket].push(current.trim());
    current = null;
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flush();
      continue;
    }
    const header = line.replace(/[*_#:]/g, "").trim().toLowerCase();
    if (/^(key )?inclusion( criteria)?$/.test(header) || /^inclusion criteria/.test(header)) {
      flush();
      bucket = "inclusion";
      continue;
    }
    if (/^(key )?exclusion( criteria)?$/.test(header) || /^exclusion criteria/.test(header)) {
      flush();
      bucket = "exclusion";
      continue;
    }
    const bullet = line.match(/^(?:[*\-•]|\d+[.)])\s+(.*)$/);
    const indented = /^\s{2,}/.test(rawLine);
    if (bullet && !indented) {
      flush();
      current = bullet[1];
    } else if (bullet && indented && current != null) {
      current += `\n  • ${bullet[1]}`;
    } else if (current != null) {
      current += ` ${line}`;
    } else {
      current = line;
    }
  }
  flush();
  return out;
}
