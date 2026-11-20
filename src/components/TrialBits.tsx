import Link from "next/link";
import { Icon } from "./Icon";
import { PHASE_SHORT, STATUS_TH, label } from "@/lib/labels";
import { provinceTh } from "@/lib/provinces";
import { ageRangeTh } from "@/lib/search";
import type { Trial } from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  RECRUITING: "bg-ok-soft text-ok",
  NOT_YET_RECRUITING: "bg-warn-soft text-warn",
  ENROLLING_BY_INVITATION: "bg-warn-soft text-warn",
  ACTIVE_NOT_RECRUITING: "bg-surface-2 text-muted",
  COMPLETED: "bg-surface-2 text-muted",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLE[status] ?? "bg-danger-soft text-danger"
      }`}
    >
      {status === "RECRUITING" && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {label(STATUS_TH, status)}
    </span>
  );
}

export function PhaseBadge({ phases }: { phases: string[] }) {
  if (!phases.length || (phases.length === 1 && phases[0] === "NA")) return null;
  return (
    <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
      ระยะ {phases.map((p) => PHASE_SHORT[p] ?? p).join("/")}
    </span>
  );
}

export function TrialCard({ t, highlightProvince }: { t: Trial; highlightProvince?: string }) {
  const provinces = [...new Set(t.sites.map((s) => s.province).filter(Boolean))] as string[];
  const shown = highlightProvince && provinces.includes(highlightProvince)
    ? [highlightProvince, ...provinces.filter((p) => p !== highlightProvince)]
    : provinces;
  return (
    <Link
      href={`/trials/${t.id}`}
      className="card card-hover group block p-4 sm:p-5"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge status={t.status} />
        <PhaseBadge phases={t.phases} />
        {t.healthyVolunteers && (
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">รับคนสุขภาพดี</span>
        )}
        <span className="ml-auto text-xs text-muted">{t.id}</span>
      </div>
      <h3 className="font-semibold leading-snug group-hover:text-primary">{t.title}</h3>
      {t.conditions.length > 0 && (
        <p className="mt-1 line-clamp-1 text-sm text-muted">{t.conditions.slice(0, 4).join(" · ")}</p>
      )}
      <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
        <div className="flex gap-1.5">
          <dt className="text-muted"><Icon name="pin" className="mt-0.5 size-4" /></dt>
          <dd className="line-clamp-1">
            {shown.length ? shown.slice(0, 3).map((p) => provinceTh(p)).join(", ") : "ไม่ระบุ"}
            {shown.length > 3 && ` +${shown.length - 3}`}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted"><Icon name="user" className="mt-0.5 size-4" /></dt>
          <dd>
            {ageRangeTh(t.minAge, t.maxAge)}
            {t.sex !== "ALL" && ` · ${t.sex === "MALE" ? "ชาย" : "หญิง"}`}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted"><Icon name="building" className="mt-0.5 size-4" /></dt>
          <dd className="line-clamp-1">{t.sponsor}</dd>
        </div>
      </dl>
    </Link>
  );
}

export function Pagination({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  const nums = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const list = [...nums].sort((a, b) => a - b);
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-1" aria-label="หน้า">
      {page > 1 && (
        <Link className="btn-ghost px-3" href={href(page - 1)}>
          ‹ ก่อนหน้า
        </Link>
      )}
      {list.map((n, i) => (
        <span key={n} className="flex items-center gap-1">
          {i > 0 && list[i - 1] !== n - 1 && <span className="px-1 text-muted">…</span>}
          <Link
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={n === page ? "btn-primary px-3" : "btn-ghost px-3"}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link className="btn-ghost px-3" href={href(page + 1)}>
          ถัดไป ›
        </Link>
      )}
    </nav>
  );
}

export function PageTitle({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
