import type { Metadata } from "next";
import Link from "next/link";
import { ColumnChart, RankChart, ShareBar } from "@/components/Charts";
import { ResearchFilters } from "@/components/ResearchFilters";
import { PageTitle } from "@/components/TrialBits";
import { getDataset } from "@/lib/ctgov";
import { num, thDateTime } from "@/lib/format";
import { INTERVENTION_TH, PHASE_TH, SPONSOR_CLASS_TH, STATUS_TH } from "@/lib/labels";
import { parseFilter, qs, spToRecord } from "@/lib/params";
import { filterTrials } from "@/lib/search";
import { computeDashboard } from "@/lib/stats";

export const metadata: Metadata = { title: "ภาพรวมงานวิจัยในไทย" };

export default async function ResearchPage({ searchParams }: PageProps<"/research">) {
  const sp = await searchParams;
  const f = parseFilter(sp, { status: "all" });
  const data = await getDataset();
  const trials = filterTrials(data.trials, f);
  const d = computeDashboard(trials, {
    phase: PHASE_TH,
    sponsorClass: SPONSOR_CLASS_TH,
    status: STATUS_TH,
    intervention: INTERVENTION_TH,
  });
  const base = spToRecord(sp);
  const baseQs = qs(base).replace(/^\?/, "");

  const kpis = [
    { v: num(d.total), l: "งานวิจัยทั้งหมด", s: "ที่มีศูนย์วิจัยในไทย" },
    { v: num(d.open), l: "เปิดรับ / กำลังจะเปิด", s: d.total ? `${Math.round((d.open / d.total) * 100)}% ของทั้งหมด` : "" },
    { v: `${Math.round(d.industryShare * 100)}%`, l: "สนับสนุนโดยภาคเอกชน", s: "บริษัทยา/อุปกรณ์" },
    { v: num(d.siteCount), l: "ศูนย์วิจัย", s: `ใน ${d.provinceCount} จังหวัด` },
    { v: num(d.startedThisYear), l: `เริ่มในปี ${d.thisYear + 543}`, s: "ตามวันเริ่มศึกษา" },
    { v: d.medianEnrollment ? num(d.medianEnrollment) : "-", l: "ค่ามัธยฐานอาสาสมัคร", s: "ต่อโครงการ (ทั่วโลก)" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTitle
        title="ภาพรวมงานวิจัยทางคลินิกในไทย"
        sub={<>ข้อมูลจาก ClinicalTrials.gov อัปเดต {thDateTime(data.fetchedAt)} · คลิกแท่งกราฟเพื่อดูรายละเอียด</>}
      >
        <div className="flex gap-2">
          <Link href={`/research/explore${qs(base)}`} className="btn-ghost">
            สำรวจข้อมูล →
          </Link>
          <a href={`/api/export${qs({ ...base, status: f.status })}`} className="btn-ghost">
            ⬇ CSV
          </a>
        </div>
      </PageTitle>

      <ResearchFilters f={f} action="/research" resetHref="/research" />

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.l} className="card p-4">
            <div className="text-2xl font-bold tabular-nums">{k.v}</div>
            <div className="text-sm font-medium">{k.l}</div>
            <div className="text-xs text-muted">{k.s}</div>
          </div>
        ))}
      </section>

      {d.total === 0 ? (
        <div className="card p-8 text-center text-muted">ไม่มีข้อมูลตามตัวกรองนี้</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <ColumnChart title="จำนวนงานวิจัยตามปีที่เริ่ม (พ.ศ.)" sub="15 ปีล่าสุด รวมปีหน้าที่วางแผนไว้" data={d.byYear} />
          </div>
          <ColumnChart title="ระยะการทดลอง" sub="การศึกษาที่ไม่ใช่ยา นับเป็น “ไม่แบ่งระยะ”" data={d.byPhase} />
          <div className="grid gap-4">
            <ShareBar title="ประเภทผู้สนับสนุนหลัก" data={d.bySponsorClass} />
            <ShareBar title="สถานะงานวิจัย" data={d.byStatus} />
          </div>
          <RankChart
            title="โรค/ภาวะที่ศึกษามากที่สุด"
            data={d.topConditions}
            drill={{ param: "q", base: baseQs }}
          />
          <RankChart
            title="จังหวัดที่มีงานวิจัยมากที่สุด"
            data={d.topProvinces}
            drill={{ param: "province", base: baseQs }}
          />
          <RankChart
            title="ผู้สนับสนุนที่มีงานวิจัยมากที่สุด"
            data={d.topSponsors}
            drill={{ param: "sponsor", base: baseQs }}
          />
          <RankChart title="ประเภทสิ่งที่ทดสอบ" data={d.byInterventionType} drill={{ param: "interventionType", base: baseQs }} />
        </div>
      )}
    </div>
  );
}
