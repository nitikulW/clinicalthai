"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PHASE_SHORT } from "@/lib/labels";
import { PROVINCES } from "@/lib/provinces";
import { StatusBadge } from "./TrialBits";

interface Answers {
  age: string;
  sex: "" | "MALE" | "FEMALE";
  province: string;
  travel: "province" | "region" | "anywhere";
  conditions: string[];
  otherCondition: string;
  healthyWilling: boolean;
}

interface Result {
  id: string;
  title: string;
  status: string;
  phases: string[];
  conditions: string[];
  reasons: string[];
  nearSites: string[];
}

const KEY = "clinicalthai.screen.v1";
const EMPTY: Answers = {
  age: "",
  sex: "",
  province: "",
  travel: "region",
  conditions: [],
  otherCondition: "",
  healthyWilling: false,
};
const PROVINCES_TH = [...PROVINCES].sort((a, b) => a.th.localeCompare(b.th, "th"));

export function ScreenForm({ conditions }: { conditions: string[] }) {
  const [a, setA] = useState<Answers>(EMPTY);
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore a saved draft once after mount
      if (saved) setA({ ...EMPTY, ...JSON.parse(saved) });
    } catch {
      /* storage unavailable */
    }
  }, []);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((prev) => ({ ...prev, [k]: v }));
  const toggleCond = (c: string) =>
    set("conditions", a.conditions.includes(c) ? a.conditions.filter((x) => x !== c) : [...a.conditions, c]);

  const hasTopic = a.conditions.length > 0 || a.otherCondition.trim() !== "" || a.healthyWilling;
  const valid = a.age !== "" && a.sex !== "" && hasTopic;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      try {
        localStorage.setItem(KEY, JSON.stringify(a));
      } catch {
        /* ignore */
      }
      const r = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, age: Number(a.age), province: a.province || undefined }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "เกิดข้อผิดพลาด");
      setResults(j.results);
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setA(EMPTY);
    setResults(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="card space-y-6 p-5 sm:p-6">
        <Step n={1} title="อายุและเพศ">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-age">
                อายุ (ปี)
              </label>
              <input
                id="s-age"
                type="number"
                inputMode="numeric"
                min={0}
                max={120}
                required
                value={a.age}
                onChange={(e) => set("age", e.target.value)}
                className="field"
              />
            </div>
            <fieldset>
              <legend className="label">เพศกำเนิด</legend>
              <div className="flex gap-2">
                {(
                  [
                    ["FEMALE", "หญิง"],
                    ["MALE", "ชาย"],
                  ] as const
                ).map(([v, l]) => (
                  <label
                    key={v}
                    className={`btn flex-1 cursor-pointer border ${a.sex === v ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface"}`}
                  >
                    <input type="radio" name="sex" value={v} checked={a.sex === v} onChange={() => set("sex", v)} className="sr-only" />
                    {l}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </Step>

        <Step n={2} title="คุณอยู่จังหวัดไหน และเดินทางได้ไกลแค่ไหน">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-province">
                จังหวัดที่อยู่
              </label>
              <select id="s-province" value={a.province} onChange={(e) => set("province", e.target.value)} className="field">
                <option value="">ไม่ระบุ</option>
                {PROVINCES_TH.map((p) => (
                  <option key={p.en} value={p.en}>
                    {p.th}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="s-travel">
                เดินทางไปศูนย์วิจัยได้
              </label>
              <select
                id="s-travel"
                value={a.travel}
                onChange={(e) => set("travel", e.target.value as Answers["travel"])}
                disabled={!a.province}
                className="field"
              >
                <option value="province">เฉพาะในจังหวัด</option>
                <option value="region">ในภาคเดียวกัน</option>
                <option value="anywhere">ที่ไหนก็ได้</option>
              </select>
            </div>
          </div>
        </Step>

        <Step n={3} title="คุณมีโรคหรือภาวะเหล่านี้ไหม (เลือกได้หลายข้อ)">
          <div className="flex flex-wrap gap-2">
            {conditions.map((c) => {
              const on = a.conditions.includes(c);
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => toggleCond(c)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    on ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface hover:border-primary"
                  }`}
                >
                  {on && "✓ "}
                  {c}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <label className="label" htmlFor="s-other">
              โรคอื่นๆ (พิมพ์เอง)
            </label>
            <input
              id="s-other"
              value={a.otherCondition}
              onChange={(e) => set("otherCondition", e.target.value)}
              className="field"
              placeholder="เช่น ไมเกรน, สิว, psoriasis"
            />
          </div>
        </Step>

        <Step n={4} title="สนใจเป็นอาสาสมัครสุขภาพดีด้วยไหม">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 hover:bg-surface-2">
            <input
              type="checkbox"
              checked={a.healthyWilling}
              onChange={(e) => set("healthyWilling", e.target.checked)}
              className="mt-1 size-4 accent-primary"
            />
            <span>
              <span className="font-medium">สนใจ</span>
              <span className="block text-sm text-muted">
                งานวิจัยบางงาน เช่น วัคซีน หรือการศึกษาระยะที่ 1 ต้องการคนที่ไม่มีโรคประจำตัว
              </span>
            </span>
          </label>
        </Step>

        {!hasTopic && a.age !== "" && a.sex !== "" && (
          <p className="text-sm text-warn">เลือกโรคอย่างน้อย 1 ข้อ หรือติ๊ก “สนใจเป็นอาสาสมัครสุขภาพดี”</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary px-6 py-2.5" disabled={!valid || loading}>
            {loading ? "กำลังค้นหา…" : "ดูงานวิจัยที่อาจเหมาะกับฉัน"}
          </button>
          <button type="button" onClick={reset} className="btn-ghost">
            เริ่มใหม่
          </button>
        </div>
        <p className="text-xs text-muted">
          คำตอบเก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น ระบบไม่บันทึกข้อมูลสุขภาพของคุณ
        </p>
        {error && <p className="rounded-lg bg-danger-soft p-3 text-sm text-danger">{error}</p>}
      </form>

      <div ref={resultsRef} className="scroll-mt-32">
        {results && (
          <section>
            <h2 className="text-xl font-bold">
              {results.length ? `พบ ${results.length} งานวิจัยที่อาจเหมาะกับคุณ` : "ยังไม่พบงานวิจัยที่ตรงกับคุณ"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              นี่เป็นการคัดกรองจากอายุ เพศ พื้นที่ และหัวข้อเท่านั้น ยังต้องผ่านเกณฑ์อื่นๆ ของแต่ละงานวิจัย
              กดเข้าไปดูเพื่อเช็กเกณฑ์ละเอียด
            </p>
            {results.length === 0 && (
              <div className="card mt-4 p-6 text-center">
                <p>ลองขยายพื้นที่การเดินทาง หรือเลือกหัวข้อเพิ่ม</p>
                <Link href="/alerts" className="btn-primary mt-3">
                  🔔 แจ้งเตือนฉันเมื่อมีงานวิจัยใหม่
                </Link>
              </div>
            )}
            <ul className="mt-4 space-y-3">
              {results.map((r) => (
                <li key={r.id}>
                  <Link href={`/trials/${r.id}`} className="card block p-4 transition hover:border-primary">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <StatusBadge status={r.status} />
                      {r.phases.length > 0 && r.phases[0] !== "NA" && (
                        <span className="text-xs text-muted">ระยะ {r.phases.map((p) => PHASE_SHORT[p] ?? p).join("/")}</span>
                      )}
                    </div>
                    <p className="font-semibold leading-snug">{r.title}</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {r.reasons.map((x) => (
                        <li key={x} className="rounded-full bg-ok-soft px-2.5 py-0.5 text-xs text-ok">
                          ✓ {x}
                        </li>
                      ))}
                    </ul>
                    {r.nearSites.length > 0 && <p className="mt-2 text-sm text-muted">📍 {r.nearSites.join(" · ")}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 flex items-center gap-2 font-semibold">
        <span className="grid size-7 place-items-center rounded-full bg-primary-soft text-sm text-primary">{n}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
