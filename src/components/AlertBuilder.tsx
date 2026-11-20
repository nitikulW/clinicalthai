"use client";

import { useState } from "react";
import { PROVINCES } from "@/lib/provinces";
import { POPULAR_TOPICS } from "@/lib/thai-terms";

const PROVINCES_TH = [...PROVINCES].sort((a, b) => a.th.localeCompare(b.th, "th"));

export function AlertBuilder({ oaId }: { oaId: string | null }) {
  const [topic, setTopic] = useState("");
  const [province, setProvince] = useState("");
  const [copied, setCopied] = useState(false);
  const provTh = PROVINCES.find((p) => p.en === province)?.th;
  const command = `ติดตาม ${topic.trim() || "…"}${provTh ? ` ${provTh}` : ""}`;
  const ready = topic.trim().length > 0;
  const basicId = oaId ? (oaId.startsWith("@") ? oaId : `@${oaId}`) : null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <section className="card p-5">
      <h2 className="text-lg font-semibold">สร้างคำสั่งติดตาม</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="a-topic">
            โรค / หัวข้อ
          </label>
          <input
            id="a-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="field"
            placeholder="เช่น เบาหวาน"
            list="a-topics"
          />
          <datalist id="a-topics">
            {POPULAR_TOPICS.map((t) => (
              <option key={t.q} value={t.q} />
            ))}
            <option value="สุขภาพดี" />
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="a-prov">
            จังหวัด (ไม่บังคับ)
          </label>
          <select id="a-prov" value={province} onChange={(e) => setProvince(e.target.value)} className="field">
            <option value="">ทุกจังหวัด</option>
            {PROVINCES_TH.map((p) => (
              <option key={p.en} value={p.en}>
                {p.th}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 p-4">
        <code className="flex-1 text-lg">{command}</code>
        <button type="button" onClick={copy} disabled={!ready} className="btn-ghost">
          {copied ? "คัดลอกแล้ว ✓" : "คัดลอก"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {basicId ? (
          <>
            <a
              href={`https://line.me/R/ti/p/${encodeURIComponent(basicId)}`}
              target="_blank"
              rel="noreferrer"
              className="btn bg-[#06C755] text-white hover:brightness-95"
            >
              เพิ่มเพื่อนใน LINE
            </a>
            <a
              href={ready ? `https://line.me/R/oaMessage/${encodeURIComponent(basicId)}/?${encodeURIComponent(command)}` : undefined}
              aria-disabled={!ready}
              target="_blank"
              rel="noreferrer"
              className={`btn-primary ${ready ? "" : "pointer-events-none opacity-50"}`}
            >
              ส่งคำสั่งนี้ใน LINE
            </a>
          </>
        ) : (
          <p className="text-sm text-muted">บัญชี LINE ของระบบยังไม่เปิดใช้งาน</p>
        )}
      </div>
    </section>
  );
}
