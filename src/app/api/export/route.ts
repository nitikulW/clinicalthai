import type { NextRequest } from "next/server";
import { getTrials } from "@/lib/ctgov";
import { PHASE_SHORT, SPONSOR_CLASS_TH, STATUS_TH, label } from "@/lib/labels";
import { parseFilter } from "@/lib/params";
import { provinceTh } from "@/lib/provinces";
import { filterTrials, sortTrials } from "@/lib/search";
import { siteTable, sponsorTable } from "@/lib/stats";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: unknown[][]): string {
  // BOM so Excel opens Thai text as UTF-8
  return "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export async function GET(req: NextRequest) {
  const sp = Object.fromEntries(req.nextUrl.searchParams.entries());
  const view = sp.view ?? "trials";
  const trials = filterTrials(await getTrials(), parseFilter(sp, { status: "all" }));
  let rows: unknown[][];

  if (view === "sponsors") {
    rows = [
      ["ผู้สนับสนุน", "ประเภท", "จำนวนงานวิจัย", "เปิดรับ", "P1", "P2", "P3", "P4", "ศูนย์วิจัย", "จังหวัด", "โรคหลัก", "เริ่มล่าสุด"],
      ...sponsorTable(trials).map((s) => [
        s.name,
        label(SPONSOR_CLASS_TH, s.sponsorClass),
        s.trials,
        s.open,
        s.phase.PHASE1 ?? 0,
        s.phase.PHASE2 ?? 0,
        s.phase.PHASE3 ?? 0,
        s.phase.PHASE4 ?? 0,
        s.sites,
        s.provinces,
        s.topConditions.join("; "),
        s.latestStart ?? "",
      ]),
    ];
  } else if (view === "sites") {
    rows = [
      ["ศูนย์วิจัย", "จังหวัด", "จำนวนงานวิจัย", "เปิดรับ", "ภาคเอกชน", "ผู้สนับสนุนหลัก"],
      ...siteTable(trials).map((s) => [
        s.facility,
        provinceTh(s.province),
        s.trials,
        s.open,
        s.industry,
        s.topSponsors.join("; "),
      ]),
    ];
  } else {
    rows = [
      ["NCT ID", "ชื่อ", "สถานะ", "ระยะ", "ประเภท", "โรค/ภาวะ", "สิ่งที่ทดสอบ", "ผู้สนับสนุน", "ประเภทผู้สนับสนุน", "จำนวนอาสาสมัคร", "วันเริ่ม", "วันเสร็จ (หลัก)", "จังหวัด", "ศูนย์วิจัยในไทย", "ลิงก์"],
      ...sortTrials(trials, "start").map((t) => [
        t.id,
        t.title,
        label(STATUS_TH, t.status),
        t.phases.map((p) => PHASE_SHORT[p] ?? p).join("/"),
        t.studyType,
        t.conditions.join("; "),
        t.interventions.map((i) => `${i.type}: ${i.name}`).join("; "),
        t.sponsor,
        label(SPONSOR_CLASS_TH, t.sponsorClass),
        t.enrollment ?? "",
        t.startDate ?? "",
        t.completionDate ?? "",
        [...new Set(t.sites.map((s) => provinceTh(s.province)))].join("; "),
        t.sites.length,
        `https://clinicaltrials.gov/study/${t.id}`,
      ]),
    ];
  }

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clinicalthai-${view}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
