"use client";

import { useEffect, useState } from "react";
import type { PlainThai } from "@/lib/ai";

interface Props {
  id: string;
  aiEnabled: boolean;
  inclusion: string[];
  exclusion: string[];
  otherCriteria: string[];
}

export function TrialAssist({ id, aiEnabled, inclusion, exclusion, otherCriteria }: Props) {
  const [ai, setAi] = useState<PlainThai | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"th" | "en">("th");

  useEffect(() => {
    let alive = true;
    fetch(`/api/translate/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && j?.data && setAi(j.data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id]);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/translate/${id}`, { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "แปลไม่สำเร็จ");
      setAi(j.data);
      setLang("th");
    } catch (e) {
      setError(e instanceof Error ? e.message : "แปลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  const useThai = lang === "th" && ai !== null;
  const inc = useThai ? ai.inclusion_th : inclusion;
  const exc = useThai ? ai.exclusion_th : exclusion;

  return (
    <>
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-primary-soft px-5 py-3">
          <h2 className="font-semibold text-primary">✨ อธิบายแบบเข้าใจง่าย</h2>
          {!ai && aiEnabled && (
            <button onClick={generate} disabled={loading} className="btn-primary py-1.5 text-sm">
              {loading ? "กำลังอธิบาย… (ประมาณ 10–30 วินาที)" : "อธิบายเป็นภาษาไทยด้วย AI"}
            </button>
          )}
        </div>
        <div className="p-5">
          {ai ? (
            <div className="space-y-4">
              <p className="text-lg font-semibold leading-snug">{ai.title_th}</p>
              <div>
                <h3 className="text-sm font-medium text-muted">งานวิจัยนี้เกี่ยวกับอะไร</h3>
                <p className="mt-1 leading-relaxed">{ai.summary_th}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted">ถ้าเข้าร่วม ต้องทำอะไรบ้าง</h3>
                <p className="mt-1 leading-relaxed">{ai.what_you_do_th}</p>
              </div>
              {ai.questions_th.length > 0 && (
                <div className="rounded-xl bg-surface-2 p-4">
                  <h3 className="font-medium">คำถามที่ควรถามทีมวิจัย</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
                    {ai.questions_th.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted">
                สรุปโดย AI จากข้อมูลในทะเบียน อาจคลาดเคลื่อนได้ ยึดเอกสารของทีมวิจัยเป็นหลัก
              </p>
            </div>
          ) : aiEnabled ? (
            <p className="text-muted">
              กดปุ่มด้านบนเพื่อให้ AI สรุปงานวิจัยนี้ และแปลเกณฑ์รับสมัครเป็นภาษาไทยที่เข้าใจง่าย
            </p>
          ) : (
            <p className="text-muted">
              ฟีเจอร์แปลด้วย AI ยังไม่เปิดใช้ (ผู้ดูแลต้องตั้งค่า <code>ANTHROPIC_API_KEY</code>) — ระหว่างนี้ดูเกณฑ์ต้นฉบับด้านล่างได้
            </p>
          )}
          {error && <p className="mt-3 rounded-lg bg-danger-soft p-3 text-sm text-danger">{error}</p>}
        </div>
      </section>

      <EligibilityChecklist
        key={useThai ? "th" : "en"}
        inclusion={inc}
        exclusion={exc}
        other={useThai ? [] : otherCriteria}
        langToggle={
          ai ? (
            <div className="flex rounded-lg border border-line p-0.5 text-sm">
              {(["th", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-md px-3 py-1 ${lang === l ? "bg-primary text-primary-ink" : "text-muted"}`}
                >
                  {l === "th" ? "ไทย" : "ต้นฉบับ"}
                </button>
              ))}
            </div>
          ) : null
        }
      />
    </>
  );
}

function EligibilityChecklist({
  inclusion,
  exclusion,
  other,
  langToggle,
}: {
  inclusion: string[];
  exclusion: string[];
  other: string[];
  langToggle: React.ReactNode;
}) {
  const [inc, setInc] = useState<Set<number>>(new Set());
  const [exc, setExc] = useState<Set<number>>(new Set());
  const toggle = (set: Set<number>, fn: (s: Set<number>) => void, i: number) => {
    const n = new Set(set);
    if (n.has(i)) n.delete(i);
    else n.add(i);
    fn(n);
  };

  if (!inclusion.length && !exclusion.length && !other.length) {
    return (
      <section className="card p-5">
        <h2 className="text-lg font-semibold">เกณฑ์การคัดเลือก</h2>
        <p className="mt-2 text-muted">ทะเบียนไม่ได้ระบุเกณฑ์ไว้ สอบถามทีมวิจัยโดยตรง</p>
      </section>
    );
  }

  const touched = inc.size + exc.size > 0;

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">เช็กเกณฑ์ด้วยตัวเอง</h2>
          <p className="text-sm text-muted">ติ๊กข้อที่ตรงกับคุณ (ข้อมูลไม่ถูกส่งไปที่ใด)</p>
        </div>
        {langToggle}
      </div>

      {inclusion.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-ok">✓ เกณฑ์คัดเข้า — ต้องมีทุกข้อ</h3>
          <ul className="mt-2 space-y-1">
            {inclusion.map((c, i) => (
              <li key={i}>
                <label className="flex cursor-pointer gap-3 rounded-lg p-2 hover:bg-surface-2">
                  <input
                    type="checkbox"
                    checked={inc.has(i)}
                    onChange={() => toggle(inc, setInc, i)}
                    className="mt-1 size-4 shrink-0 accent-[var(--ok)]"
                  />
                  <span className="whitespace-pre-line text-[15px] leading-relaxed">{c}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {exclusion.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-danger">✕ เกณฑ์คัดออก — ถ้ามีข้อใดข้อหนึ่ง อาจเข้าร่วมไม่ได้</h3>
          <ul className="mt-2 space-y-1">
            {exclusion.map((c, i) => (
              <li key={i}>
                <label className="flex cursor-pointer gap-3 rounded-lg p-2 hover:bg-surface-2">
                  <input
                    type="checkbox"
                    checked={exc.has(i)}
                    onChange={() => toggle(exc, setExc, i)}
                    className="mt-1 size-4 shrink-0 accent-[var(--danger)]"
                  />
                  <span className="whitespace-pre-line text-[15px] leading-relaxed">{c}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {other.length > 0 && (
        <div className="mt-4 space-y-1 text-[15px] text-muted">
          {other.map((o, i) => (
            <p key={i} className="whitespace-pre-line">
              {o}
            </p>
          ))}
        </div>
      )}

      {touched && (
        <div
          className={`mt-4 rounded-xl p-4 text-[15px] ${
            exc.size > 0 ? "bg-danger-soft text-danger" : inc.size === inclusion.length ? "bg-ok-soft text-ok" : "bg-surface-2"
          }`}
          role="status"
        >
          {exc.size > 0
            ? `คุณติ๊กเกณฑ์คัดออก ${exc.size} ข้อ — อาจไม่เข้าเกณฑ์ แต่ควรสอบถามทีมวิจัยเพื่อความแน่ใจ`
            : inc.size === inclusion.length
              ? "ดูเหมือนคุณตรงกับเกณฑ์คัดเข้าทุกข้อ ลองติดต่อทีมวิจัยเพื่อคัดกรองอย่างเป็นทางการ"
              : `ตรงกับเกณฑ์คัดเข้า ${inc.size} จาก ${inclusion.length} ข้อ`}
        </div>
      )}
    </section>
  );
}
