import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrialAssist } from "@/components/TrialAssist";
import { PhaseBadge, StatusBadge } from "@/components/TrialBits";
import { aiEnabled } from "@/lib/ai";
import { getTrialDetail } from "@/lib/ctgov";
import { parseCriteria } from "@/lib/eligibility";
import { ctgovUrl, num, thDate } from "@/lib/format";
import {
  INTERVENTION_TH,
  PHASE_EXPLAIN,
  PHASE_TH,
  SEX_TH,
  SPONSOR_CLASS_TH,
  STUDY_TYPE_TH,
  label,
} from "@/lib/labels";
import { provinceTh } from "@/lib/provinces";
import { ageRangeTh } from "@/lib/search";
import type { Contact } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/trials/[id]">): Promise<Metadata> {
  const { id } = await params;
  const t = await getTrialDetail(id).catch(() => null);
  return { title: t ? t.title : id };
}

function ContactLine({ c }: { c: Contact }) {
  return (
    <li className="text-sm">
      {c.name && <span className="font-medium">{c.name}</span>}
      {c.role && c.role !== "CONTACT" && <span className="text-muted"> ({c.role === "PRINCIPAL_INVESTIGATOR" ? "หัวหน้าโครงการ" : c.role})</span>}
      <span className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1">
        {c.phone && (
          <a className="text-primary underline" href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>
            ☎ {c.phone}
            {c.phoneExt ? ` ต่อ ${c.phoneExt}` : ""}
          </a>
        )}
        {c.email && (
          <a className="break-all text-primary underline" href={`mailto:${c.email}`}>
            ✉ {c.email}
          </a>
        )}
      </span>
    </li>
  );
}

export default async function TrialPage({ params }: PageProps<"/trials/[id]">) {
  const { id } = await params;
  const t = await getTrialDetail(id.toUpperCase());
  if (!t) notFound();

  const criteria = parseCriteria(t.eligibilityCriteria);
  const phaseKey = t.phases[0] ?? "NA";
  const contactable = t.centralContacts.length > 0 || t.sites.some((s) => s.contacts.length > 0);

  const facts: [string, React.ReactNode][] = [
    ["อายุที่รับ", ageRangeTh(t.minAge, t.maxAge)],
    ["เพศ", label(SEX_TH, t.sex)],
    ["คนสุขภาพดี", t.healthyVolunteers ? "รับ" : "ไม่รับ (ต้องมีโรค/ภาวะที่ศึกษา)"],
    ["จำนวนอาสาสมัคร", t.enrollment ? `${num(t.enrollment)} คน (ทั้งโครงการ)` : "-"],
    ["ประเภท", label(STUDY_TYPE_TH, t.studyType)],
    ["ระยะ", t.phases.length ? t.phases.map((p) => label(PHASE_TH, p)).join(" / ") : "ไม่แบ่งระยะ"],
    ["ผู้สนับสนุน", `${t.sponsor} · ${label(SPONSOR_CLASS_TH, t.sponsorClass)}`],
    ["ช่วงเวลา", `${thDate(t.startDate)} – ${thDate(t.completionDate)}`],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/trials" className="hover:text-primary">
          ← กลับไปหน้าค้นหา
        </Link>
      </nav>

      <header className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={t.status} />
          <PhaseBadge phases={t.phases} />
          <a href={ctgovUrl(t.id)} target="_blank" rel="noreferrer" className="text-sm text-muted underline hover:text-primary">
            {t.id} บน ClinicalTrials.gov ↗
          </a>
        </div>
        <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{t.title}</h1>
        {t.officialTitle && t.officialTitle !== t.title && <p className="mt-2 text-muted">{t.officialTitle}</p>}
        {t.conditions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {t.conditions.map((c) => (
              <span key={c} className="rounded-full bg-surface-2 px-3 py-1 text-sm">
                {c}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <section className="card p-5">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm text-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-lg bg-surface-2 p-3 text-sm">
              <strong>{label(PHASE_TH, phaseKey)}:</strong> {PHASE_EXPLAIN[phaseKey] ?? PHASE_EXPLAIN.NA}
            </p>
          </section>

          <TrialAssist
            id={t.id}
            aiEnabled={aiEnabled()}
            inclusion={criteria.inclusion}
            exclusion={criteria.exclusion}
            otherCriteria={criteria.other}
          />

          <section className="card p-5">
            <h2 className="mb-2 text-lg font-semibold">รายละเอียดจากต้นฉบับ (ภาษาอังกฤษ)</h2>
            {t.summary && <p className="whitespace-pre-line leading-relaxed">{t.summary}</p>}
            {t.detailedDescription && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-primary">อ่านรายละเอียดเพิ่มเติม</summary>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{t.detailedDescription}</p>
              </details>
            )}
            {t.interventions.length > 0 && (
              <>
                <h3 className="mt-5 font-semibold">สิ่งที่ทดสอบ</h3>
                <ul className="mt-1 space-y-1 text-sm">
                  {t.interventions.map((i, k) => (
                    <li key={k}>
                      <span className="mr-2 rounded bg-primary-soft px-1.5 py-0.5 text-xs text-primary">
                        {label(INTERVENTION_TH, i.type)}
                      </span>
                      {i.name}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {t.arms.length > 0 && (
              <>
                <h3 className="mt-5 font-semibold">กลุ่มในการศึกษา</h3>
                <ul className="mt-1 space-y-2 text-sm">
                  {t.arms.map((a, k) => (
                    <li key={k}>
                      <span className="font-medium">{a.label}</span>
                      {a.description && <span className="text-muted"> — {a.description}</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {t.primaryOutcomes.length > 0 && (
              <>
                <h3 className="mt-5 font-semibold">สิ่งที่วัดผลหลัก</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                  {t.primaryOutcomes.map((o, k) => (
                    <li key={k}>
                      {o.measure}
                      {o.timeFrame && <span className="text-muted"> ({o.timeFrame})</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="text-lg font-semibold">สนใจเข้าร่วม?</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
              <li>ติดต่อทีมวิจัยตามช่องทางด้านล่าง</li>
              <li>ทีมวิจัยจะคัดกรองและอธิบายรายละเอียด</li>
              <li>อ่านเอกสารชี้แจงก่อนลงนามยินยอม ถอนตัวได้ทุกเมื่อ</li>
            </ol>
            <Link href="/learn" className="mt-3 inline-block text-sm font-medium text-primary">
              สิทธิของอาสาสมัคร →
            </Link>
            {t.centralContacts.length > 0 && (
              <>
                <h3 className="mt-4 font-medium">ผู้ประสานงานหลัก</h3>
                <ul className="mt-2 space-y-3">
                  {t.centralContacts.map((c, k) => (
                    <ContactLine key={k} c={c} />
                  ))}
                </ul>
              </>
            )}
            {!contactable && (
              <p className="mt-3 rounded-lg bg-warn-soft p-3 text-sm text-warn">
                ทะเบียนไม่ได้ระบุช่องทางติดต่อ ลองติดต่อศูนย์วิจัยหรือโรงพยาบาลด้านล่างโดยตรง
              </p>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-lg font-semibold">ศูนย์วิจัยในไทย ({t.sites.length})</h2>
            <ul className="mt-3 space-y-4">
              {t.sites.map((s, k) => (
                <li key={k} className="border-t border-line pt-3 first:border-0 first:pt-0">
                  <p className="font-medium">{s.facility}</p>
                  <p className="text-sm text-muted">
                    {provinceTh(s.province)}
                    {s.status && s.status !== t.status && ` · ${s.status === "RECRUITING" ? "รับสมัครอยู่" : s.status === "NOT_YET_RECRUITING" ? "ยังไม่เปิดรับ" : s.status.toLowerCase()}`}
                  </p>
                  {s.contacts.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {s.contacts.map((c, j) => (
                        <ContactLine key={j} c={c} />
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            {t.otherCountries.length > 0 && (
              <p className="mt-4 text-xs text-muted">
                ทำพร้อมกันใน {t.otherCountries.length} ประเทศอื่น: {t.otherCountries.slice(0, 8).join(", ")}
                {t.otherCountries.length > 8 && " …"}
              </p>
            )}
          </section>
          <p className="px-1 text-xs text-muted">อัปเดตในทะเบียนล่าสุด {thDate(t.lastUpdated)}</p>
        </aside>
      </div>
    </div>
  );
}
