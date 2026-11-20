import type { Metadata } from "next";
import { AlertBuilder } from "@/components/AlertBuilder";
import { PageTitle } from "@/components/TrialBits";
import { lineEnabled } from "@/lib/line";

export const metadata: Metadata = { title: "แจ้งเตือนผ่าน LINE" };
export const dynamic = "force-dynamic";

export default function AlertsPage() {
  const oaId = process.env.NEXT_PUBLIC_LINE_OA_ID; // e.g. "@clinicalthai"
  const ready = lineEnabled() && Boolean(oaId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageTitle
        title="รับแจ้งเตือนงานวิจัยใหม่ผ่าน LINE"
        sub="ไม่ต้องคอยเข้าเว็บ — เมื่อมีงานวิจัยใหม่เปิดรับในเรื่องที่คุณสนใจ เราจะส่งข้อความหาคุณใน LINE"
      />

      <ol className="grid gap-4 md:grid-cols-3">
        {[
          { n: 1, t: "เพิ่มเพื่อน", d: "เพิ่ม LINE Official Account ของ ClinicalThai เป็นเพื่อน" },
          { n: 2, t: "บอกหัวข้อที่สนใจ", d: "พิมพ์ “ติดตาม” ตามด้วยชื่อโรค และจังหวัด (ถ้ามี)" },
          { n: 3, t: "รอรับข้อความ", d: "ระบบตรวจงานวิจัยใหม่ทุกวัน และส่งให้เมื่อมีงานที่ตรงกับคุณ" },
        ].map((s) => (
          <li key={s.n} className="card p-5">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-ink">{s.n}</span>
            <p className="mt-3 font-semibold">{s.t}</p>
            <p className="mt-1 text-sm text-muted">{s.d}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <AlertBuilder oaId={ready ? oaId! : null} />
      </div>

      <section className="card mt-6 p-5">
        <h2 className="text-lg font-semibold">คำสั่งที่ใช้ได้ในแชท</h2>
        <table className="mt-3 w-full text-left text-[15px]">
          <tbody className="divide-y divide-line">
            {[
              ["ติดตาม เบาหวาน", "ติดตามงานวิจัยเรื่องเบาหวานทุกจังหวัด"],
              ["ติดตาม มะเร็งเต้านม เชียงใหม่", "ติดตามเฉพาะที่มีศูนย์วิจัยในเชียงใหม่"],
              ["ติดตาม สุขภาพดี กรุงเทพ", "งานวิจัยที่รับอาสาสมัครสุขภาพดี"],
              ["รายการ", "ดูหัวข้อที่ติดตามอยู่"],
              ["ยกเลิก 1", "เลิกติดตามหัวข้อที่ 1"],
              ["ยกเลิกทั้งหมด", "เลิกติดตามทุกหัวข้อ"],
            ].map(([c, d]) => (
              <tr key={c}>
                <td className="py-2 pr-4">
                  <code className="rounded bg-surface-2 px-2 py-0.5">{c}</code>
                </td>
                <td className="py-2 text-muted">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-sm text-muted">
          เราเก็บเฉพาะรหัสผู้ใช้ LINE และหัวข้อที่คุณพิมพ์ เพื่อใช้ส่งการแจ้งเตือนเท่านั้น ยกเลิกได้ทุกเมื่อ หรือบล็อกบัญชีเพื่อหยุดรับข้อความ
        </p>
      </section>

      {!ready && (
        <section className="mt-6 rounded-2xl border border-dashed border-line p-5 text-sm text-muted">
          <p className="font-medium text-ink">สำหรับผู้ดูแลระบบ: ยังไม่ได้เชื่อม LINE</p>
          <p className="mt-1">
            ตั้งค่า <code>LINE_CHANNEL_SECRET</code>, <code>LINE_CHANNEL_ACCESS_TOKEN</code> และ{" "}
            <code>NEXT_PUBLIC_LINE_OA_ID</code> แล้วตั้ง Webhook URL ใน LINE Developers Console เป็น{" "}
            <code>/api/line/webhook</code> ดูขั้นตอนใน README
          </p>
        </section>
      )}
    </div>
  );
}
