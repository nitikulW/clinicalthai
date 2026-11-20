import type { Metadata } from "next";
import Link from "next/link";
import { ResearchFilters } from "@/components/ResearchFilters";
import { PageTitle, Pagination, StatusBadge } from "@/components/TrialBits";
import { getTrials } from "@/lib/ctgov";
import { num, thDate } from "@/lib/format";
import { PHASE_SHORT, SPONSOR_CLASS_TH, label } from "@/lib/labels";
import { one, parseFilter, qs, spToRecord } from "@/lib/params";
import { provinceTh } from "@/lib/provinces";
import { filterTrials, sortTrials } from "@/lib/search";
import { siteTable, sponsorTable } from "@/lib/stats";

export const metadata: Metadata = { title: "สำรวจข้อมูลงานวิจัย" };

const PER_PAGE = 50;
type View = "trials" | "sponsors" | "sites";

const TABS: { v: View; l: string }[] = [
  { v: "trials", l: "งานวิจัย" },
  { v: "sponsors", l: "ผู้สนับสนุน" },
  { v: "sites", l: "ศูนย์วิจัย" },
];

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase text-muted ${className}`}>{children}</th>;
}

function SortLink({ k, current, base, children }: { k: string; current: string; base: Record<string, string>; children: React.ReactNode }) {
  const active = current === k;
  return (
    <Link href={`/research/explore${qs({ ...base, sort: k, page: undefined })}`} className={active ? "text-ink underline" : "hover:text-ink"}>
      {children}
      {active && " ↓"}
    </Link>
  );
}

export default async function ExplorePage({ searchParams }: PageProps<"/research/explore">) {
  const sp = await searchParams;
  const view = (["sponsors", "sites"].includes(one(sp.view) ?? "") ? one(sp.view) : "trials") as View;
  const f = parseFilter(sp, { status: "all" });
  const trials = filterTrials(await getTrials(), f);
  const base = spToRecord(sp);
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const sort = one(sp.sort) ?? "";
  const pageHref = (p: number) => `/research/explore${qs({ ...base, page: p === 1 ? undefined : p })}`;

  let body: React.ReactNode;
  let count = 0;

  if (view === "sponsors") {
    const rows = sponsorTable(trials);
    if (sort === "open") rows.sort((a, b) => b.open - a.open);
    else if (sort === "sites") rows.sort((a, b) => b.sites - a.sites);
    else if (sort === "latest") rows.sort((a, b) => (b.latestStart ?? "").localeCompare(a.latestStart ?? ""));
    count = rows.length;
    body = (
      <table className="w-full min-w-[860px] text-sm">
        <thead className="border-b border-line">
          <tr>
            <Th>ผู้สนับสนุน</Th>
            <Th>ประเภท</Th>
            <Th className="text-right">
              <SortLink k="" current={sort} base={base}>งานวิจัย</SortLink>
            </Th>
            <Th className="text-right">
              <SortLink k="open" current={sort} base={base}>เปิดรับ</SortLink>
            </Th>
            <Th>ระยะ 1 / 2 / 3 / 4</Th>
            <Th className="text-right">
              <SortLink k="sites" current={sort} base={base}>ศูนย์</SortLink>
            </Th>
            <Th>โรคหลัก</Th>
            <Th>
              <SortLink k="latest" current={sort} base={base}>เริ่มล่าสุด</SortLink>
            </Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((r) => (
            <tr key={r.name} className="hover:bg-surface-2">
              <td className="max-w-[260px] px-3 py-2">
                <Link href={`/research/explore${qs({ ...base, view: "trials", sponsor: r.name, page: undefined, sort: undefined })}`} className="font-medium text-primary hover:underline">
                  {r.name}
                </Link>
              </td>
              <td className="px-3 py-2 text-muted">{label(SPONSOR_CLASS_TH, r.sponsorClass)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{num(r.trials)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{num(r.open)}</td>
              <td className="px-3 py-2 tabular-nums text-muted">
                {["PHASE1", "PHASE2", "PHASE3", "PHASE4"].map((p) => r.phase[p] ?? 0).join(" / ")}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {r.sites} <span className="text-muted">({r.provinces} จ.)</span>
              </td>
              <td className="max-w-[240px] px-3 py-2 text-muted">{r.topConditions.join(", ")}</td>
              <td className="whitespace-nowrap px-3 py-2 text-muted">{thDate(r.latestStart)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (view === "sites") {
    const rows = siteTable(trials);
    if (sort === "open") rows.sort((a, b) => b.open - a.open);
    else if (sort === "industry") rows.sort((a, b) => b.industry - a.industry);
    count = rows.length;
    body = (
      <table className="w-full min-w-[760px] text-sm">
        <thead className="border-b border-line">
          <tr>
            <Th>ศูนย์วิจัย</Th>
            <Th>จังหวัด</Th>
            <Th className="text-right">
              <SortLink k="" current={sort} base={base}>งานวิจัย</SortLink>
            </Th>
            <Th className="text-right">
              <SortLink k="open" current={sort} base={base}>เปิดรับ</SortLink>
            </Th>
            <Th className="text-right">
              <SortLink k="industry" current={sort} base={base}>ภาคเอกชน</SortLink>
            </Th>
            <Th>ผู้สนับสนุนหลัก</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((r) => (
            <tr key={`${r.facility}|${r.province}`} className="hover:bg-surface-2">
              <td className="max-w-[320px] px-3 py-2">
                <Link
                  href={`/research/explore${qs({ ...base, view: "trials", facility: r.facility, page: undefined, sort: undefined })}`}
                  className="font-medium text-primary hover:underline"
                >
                  {r.facility}
                </Link>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-muted">{provinceTh(r.province)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{num(r.trials)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{num(r.open)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{num(r.industry)}</td>
              <td className="max-w-[300px] px-3 py-2 text-muted">{r.topSponsors.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    const key = sort === "updated" || sort === "enrollment" || sort === "recent" ? sort : "start";
    const rows = sortTrials(trials, key);
    count = rows.length;
    body = (
      <table className="w-full min-w-[960px] text-sm">
        <thead className="border-b border-line">
          <tr>
            <Th>งานวิจัย</Th>
            <Th>สถานะ</Th>
            <Th>ระยะ</Th>
            <Th>ผู้สนับสนุน</Th>
            <Th className="text-right">
              <SortLink k="enrollment" current={key} base={base}>อาสาสมัคร</SortLink>
            </Th>
            <Th>
              <SortLink k="start" current={key} base={base}>เริ่ม</SortLink>
            </Th>
            <Th>
              <SortLink k="updated" current={key} base={base}>อัปเดต</SortLink>
            </Th>
            <Th>จังหวัด</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((t) => {
            const provs = [...new Set(t.sites.map((s) => provinceTh(s.province)))];
            return (
              <tr key={t.id} className="align-top hover:bg-surface-2">
                <td className="max-w-[340px] px-3 py-2">
                  <Link href={`/trials/${t.id}`} className="font-medium text-primary hover:underline">
                    {t.title}
                  </Link>
                  <div className="text-xs text-muted">
                    {t.id} · {t.conditions.slice(0, 3).join(", ")}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={t.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted">
                  {t.phases.length ? t.phases.map((p) => PHASE_SHORT[p] ?? p).join("/") : "-"}
                </td>
                <td className="max-w-[200px] px-3 py-2">
                  {t.sponsor}
                  <div className="text-xs text-muted">{label(SPONSOR_CLASS_TH, t.sponsorClass)}</div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{t.enrollment ? num(t.enrollment) : "-"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted">{thDate(t.startDate)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted">{thDate(t.lastUpdated)}</td>
                <td className="max-w-[180px] px-3 py-2 text-muted">
                  {provs.slice(0, 3).join(", ")}
                  {provs.length > 3 && ` +${provs.length - 3}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  const pages = Math.max(1, Math.ceil(count / PER_PAGE));
  const activeChips = [
    f.sponsor && ["sponsor", `ผู้สนับสนุน: ${f.sponsor}`],
    f.facility && ["facility", `ศูนย์: ${f.facility}`],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTitle title="สำรวจข้อมูล" sub="เปรียบเทียบผู้สนับสนุน ศูนย์วิจัย และงานวิจัยในไทย กรองแล้วส่งออกเป็น CSV ได้">
        <a href={`/api/export${qs({ ...base, status: f.status, view })}`} className="btn-ghost">
          ⬇ ดาวน์โหลด CSV
        </a>
      </PageTitle>

      <ResearchFilters f={f} action="/research/explore" hidden={{ view, facility: f.facility }} resetHref={`/research/explore?view=${view}`} />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-line bg-surface p-0.5">
          {TABS.map((t) => (
            <Link
              key={t.v}
              href={`/research/explore${qs({ ...base, view: t.v, page: undefined, sort: undefined })}`}
              className={`rounded-md px-4 py-1.5 text-sm ${view === t.v ? "bg-primary text-primary-ink" : "text-muted hover:text-ink"}`}
            >
              {t.l}
            </Link>
          ))}
        </div>
        <span className="text-sm text-muted">
          {num(count)} รายการ จาก {num(trials.length)} งานวิจัย
        </span>
        {activeChips.map(([k, l]) => (
          <Link key={k} href={`/research/explore${qs({ ...base, [k]: undefined, page: undefined })}`} className="chip">
            {l} ✕
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">{count ? body : <p className="p-8 text-center text-muted">ไม่มีข้อมูลตามตัวกรองนี้</p>}</div>
      <Pagination page={page} pages={pages} href={pageHref} />
    </div>
  );
}
