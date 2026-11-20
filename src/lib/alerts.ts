import crypto from "node:crypto";
import { OPEN_STATUSES } from "./labels";
import { siteUrl } from "./line";
import { PROVINCES, provinceByEn } from "./provinces";
import { matchesConcepts } from "./search";
import { MAX_SUBS_PER_USER, readStore, type Subscription, withStore } from "./store";
import { expandQuery } from "./thai-terms";
import type { Trial } from "./types";

const PROVINCE_ALIASES_TH: [string, string][] = [
  ...PROVINCES.map((p) => [p.th, p.en] as [string, string]),
  ["กรุงเทพฯ", "Bangkok"],
  ["กรุงเทพ", "Bangkok"],
  ["กทม", "Bangkok"],
  ["อยุธยา", "Phra Nakhon Si Ayutthaya"],
  ["โคราช", "Nakhon Ratchasima"],
  ["หาดใหญ่", "Songkhla"],
].sort((a, b) => b[0].length - a[0].length) as [string, string][];

/** Pull a Thai province name out of free text. */
export function extractProvince(text: string): { province?: string; rest: string } {
  for (const [th, en] of PROVINCE_ALIASES_TH) {
    if (text.includes(th)) {
      return { province: en, rest: text.replace(th, " ").replace(/\s*(จังหวัด|จ\.|ที่)\s*$/, "").trim() };
    }
  }
  return { rest: text.trim() };
}

export function subMatches(t: Trial, sub: Pick<Subscription, "topic" | "province">): boolean {
  if (!OPEN_STATUSES.includes(t.status)) return false;
  if (sub.province && !t.sites.some((s) => s.province === sub.province)) return false;
  return matchesConcepts(t, expandQuery(sub.topic));
}

export function describeSub(s: Pick<Subscription, "topic" | "province">) {
  const p = provinceByEn(s.province);
  return `"${s.topic}"${p ? ` ใน${p.th}` : " (ทุกจังหวัด)"}`;
}

export const HELP_TEXT = `สวัสดีครับ 👋 ผมจะแจ้งเตือนเมื่อมีงานวิจัยใหม่ที่เปิดรับอาสาสมัครในเรื่องที่คุณสนใจ

📌 วิธีใช้
• ติดตาม เบาหวาน
• ติดตาม มะเร็งเต้านม เชียงใหม่
• ติดตาม สุขภาพดี กรุงเทพ  (สำหรับอาสาสมัครสุขภาพดี)
• รายการ  — ดูหัวข้อที่ติดตาม
• ยกเลิก 1  — เลิกติดตามข้อที่ 1
• ยกเลิกทั้งหมด

ค้นหาเองได้ที่ ${siteUrl("/trials")}

⚠️ ข้อมูลจาก ClinicalTrials.gov ไม่ใช่คำแนะนำทางการแพทย์ ทีมวิจัยจะเป็นผู้ตัดสินว่าคุณเข้าเกณฑ์หรือไม่`;

/** Handle one text message from a LINE user. Returns the reply text. */
export async function handleCommand(userId: string, input: string, trials: Trial[]): Promise<string> {
  const msg = input.trim().replace(/\s+/g, " ");

  if (/^(ติดตาม|follow|sub)\s+/i.test(msg)) {
    const body = msg.replace(/^(ติดตาม|follow|sub)\s+/i, "");
    const { province, rest } = extractProvince(body);
    const topic = rest.trim();
    if (!topic || expandQuery(topic).length === 0) {
      return `ยังไม่รู้จักหัวข้อ "${topic || body}" ลองใช้ชื่อโรคทั่วไป เช่น "ติดตาม เบาหวาน" หรือพิมพ์ชื่อโรคเป็นภาษาอังกฤษก็ได้`;
    }
    const result = await withStore((s) => {
      const mine = s.subscriptions.filter((x) => x.lineUserId === userId);
      if (mine.length >= MAX_SUBS_PER_USER) return { error: `ติดตามได้สูงสุด ${MAX_SUBS_PER_USER} หัวข้อ` };
      if (mine.some((x) => x.topic === topic && x.province === province)) return { error: "ติดตามหัวข้อนี้อยู่แล้ว" };
      const sub: Subscription = {
        id: crypto.randomUUID(),
        lineUserId: userId,
        topic,
        province,
        createdAt: new Date().toISOString(),
      };
      s.subscriptions.push(sub);
      return { sub };
    });
    if ("error" in result) return result.error!;
    const current = trials.filter((t) => subMatches(t, result.sub!));
    const q = new URLSearchParams({ q: topic, ...(province ? { province } : {}) });
    return `✅ ติดตาม ${describeSub(result.sub!)} แล้ว

ตอนนี้มีงานวิจัยที่เปิดรับอยู่ ${current.length} งาน
ดูทั้งหมด: ${siteUrl(`/trials?${q}`)}

เมื่อมีงานวิจัยใหม่ ผมจะส่งข้อความแจ้งทันที`;
  }

  if (/^(รายการ|list)$/i.test(msg)) {
    const store = (await readStore()).subscriptions.filter((x) => x.lineUserId === userId);
    if (!store.length) return "ยังไม่ได้ติดตามหัวข้อใด\nพิมพ์ เช่น \"ติดตาม เบาหวาน\"";
    return `หัวข้อที่ติดตาม:\n${store.map((s, i) => `${i + 1}. ${describeSub(s)}`).join("\n")}\n\nพิมพ์ "ยกเลิก <เลข>" เพื่อเลิกติดตาม`;
  }

  if (/^(ยกเลิกทั้งหมด|unsubscribe all)$/i.test(msg)) {
    const n = await withStore((s) => {
      const before = s.subscriptions.length;
      s.subscriptions = s.subscriptions.filter((x) => x.lineUserId !== userId);
      return before - s.subscriptions.length;
    });
    return n ? `ยกเลิกการติดตามทั้งหมด ${n} หัวข้อแล้ว` : "ยังไม่ได้ติดตามหัวข้อใด";
  }

  const cancel = msg.match(/^(ยกเลิก|unsub)\s*(\d+)$/i);
  if (cancel) {
    const idx = Number(cancel[2]) - 1;
    const removed = await withStore((s) => {
      const mine = s.subscriptions.filter((x) => x.lineUserId === userId);
      const target = mine[idx];
      if (!target) return null;
      s.subscriptions = s.subscriptions.filter((x) => x.id !== target.id);
      return target;
    });
    return removed ? `เลิกติดตาม ${describeSub(removed)} แล้ว` : "ไม่พบหัวข้อหมายเลขนี้ พิมพ์ \"รายการ\" เพื่อดูหมายเลข";
  }

  return HELP_TEXT;
}

/**
 * Find trials that became open since the last run and push them to matching
 * subscribers. The first run only seeds the "seen" set.
 */
export async function computeNotifications(trials: Trial[]) {
  const openNow = trials.filter((t) => OPEN_STATUSES.includes(t.status));
  return withStore((s) => {
    const firstRun = !s.lastRunAt;
    const seen = new Set(s.seenOpen);
    const fresh = firstRun ? [] : openNow.filter((t) => !seen.has(t.id));
    const perUser = new Map<string, { sub: Subscription; trials: Trial[] }[]>();
    for (const sub of s.subscriptions) {
      const hits = fresh.filter((t) => subMatches(t, sub));
      if (!hits.length) continue;
      const list = perUser.get(sub.lineUserId) ?? [];
      list.push({ sub, trials: hits });
      perUser.set(sub.lineUserId, list);
    }
    s.seenOpen = openNow.map((t) => t.id);
    s.lastRunAt = new Date().toISOString();
    return { firstRun, freshCount: fresh.length, perUser };
  });
}

export function formatAlert(groups: { sub: Subscription; trials: Trial[] }[]): string {
  const lines: string[] = ["🔔 มีงานวิจัยใหม่เปิดรับอาสาสมัคร"];
  for (const g of groups) {
    lines.push("", `เรื่อง ${describeSub(g.sub)}: ${g.trials.length} งาน`);
    for (const t of g.trials.slice(0, 5)) {
      lines.push(`• ${t.title.slice(0, 90)}${t.title.length > 90 ? "…" : ""}`, `  ${siteUrl(`/trials/${t.id}`)}`);
    }
    if (g.trials.length > 5) lines.push(`  …และอีก ${g.trials.length - 5} งาน`);
  }
  lines.push("", "พิมพ์ \"รายการ\" เพื่อจัดการการติดตาม");
  return lines.join("\n");
}
