const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** "2024-05-01" → "1 พ.ค. 2567", "2024-05" → "พ.ค. 2567" */
export function thDate(d?: string): string {
  if (!d) return "-";
  const [y, m, day] = d.split("-").map(Number);
  if (!y) return d;
  const be = y + 543;
  if (!m) return String(be);
  if (!day) return `${TH_MONTHS[m - 1]} ${be}`;
  return `${day} ${TH_MONTHS[m - 1]} ${be}`;
}

export function thDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
}

export const num = (n: number) => n.toLocaleString("th-TH");

export function ctgovUrl(id: string) {
  return `https://clinicaltrials.gov/study/${id}`;
}
