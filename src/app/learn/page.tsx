import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/TrialBits";
import { PHASE_EXPLAIN, PHASE_TH } from "@/lib/labels";

export const metadata: Metadata = { title: "รู้ก่อนเข้าร่วมงานวิจัย" };

const RIGHTS = [
  {
    t: "ได้รับข้อมูลครบก่อนตัดสินใจ",
    d: "ทีมวิจัยต้องอธิบายวัตถุประสงค์ ขั้นตอน ระยะเวลา ความเสี่ยง และประโยชน์ที่อาจได้รับ ด้วยภาษาที่คุณเข้าใจ และให้เวลาคิดหรือปรึกษาครอบครัว",
  },
  {
    t: "ยินยอมด้วยความสมัครใจ",
    d: "คุณจะลงนามในเอกสารแสดงความยินยอม (Informed Consent) ก็ต่อเมื่อเข้าใจและเต็มใจเท่านั้น ไม่มีใครบังคับหรือกดดันคุณได้",
  },
  {
    t: "ถอนตัวได้ทุกเมื่อ",
    d: "คุณออกจากงานวิจัยได้ทุกเวลาโดยไม่ต้องให้เหตุผล และยังได้รับการรักษาตามมาตรฐานตามปกติ",
  },
  {
    t: "ข้อมูลส่วนตัวได้รับการปกป้อง",
    d: "ข้อมูลของคุณต้องถูกเก็บเป็นความลับ ผลการวิจัยที่เผยแพร่จะไม่ระบุตัวตนของคุณ",
  },
  {
    t: "ได้รับการดูแลหากเกิดผลข้างเคียง",
    d: "ควรมีการระบุชัดเจนว่าหากเกิดอันตรายจากการวิจัย ใครจะดูแลรักษาและรับผิดชอบค่าใช้จ่าย",
  },
  {
    t: "มีช่องทางร้องเรียน",
    d: "เอกสารชี้แจงต้องมีเบอร์ติดต่อทีมวิจัยและคณะกรรมการจริยธรรมการวิจัยในมนุษย์ ที่คุณติดต่อได้โดยตรง",
  },
];

const QUESTIONS = [
  "งานวิจัยนี้ต้องการศึกษาอะไร และทำไมถึงเลือกฉัน?",
  "ฉันต้องมาโรงพยาบาลกี่ครั้ง ครั้งละนานเท่าไร ตลอดโครงการกี่เดือน?",
  "มีการเจาะเลือด ตรวจพิเศษ หรือหัตถการอะไรบ้าง?",
  "ฉันอาจได้รับยาหลอก (placebo) หรือไม่ และใครเป็นคนเลือกกลุ่ม?",
  "ผลข้างเคียงหรือความเสี่ยงที่อาจเกิดขึ้นมีอะไรบ้าง?",
  "ถ้าเกิดอาการไม่พึงประสงค์ ต้องติดต่อใคร ตลอด 24 ชั่วโมงหรือไม่?",
  "มีค่าเดินทางหรือค่าชดเชยเวลาให้หรือไม่ เท่าไร?",
  "ระหว่างเข้าร่วม ฉันยังกินยาประจำตัวเดิมได้ไหม?",
  "เมื่อจบโครงการ ฉันจะได้รู้ผลการวิจัยหรือได้ใช้ยาต่อหรือไม่?",
  "งานวิจัยนี้ผ่านคณะกรรมการจริยธรรมฯ ของสถาบันไหน?",
];

const RED_FLAGS = [
  "ขอให้คุณจ่ายเงินเพื่อเข้าร่วม หรือขอเลขบัญชี/รหัส OTP",
  "เร่งให้ตัดสินใจทันที หรือไม่ให้นำเอกสารกลับไปอ่าน",
  "ไม่มีเอกสารชี้แจงหรือแบบฟอร์มยินยอมเป็นภาษาไทย",
  "สัญญาว่าจะหายขาดหรือได้ผลแน่นอน",
  "บอกไม่ได้ว่าผ่านคณะกรรมการจริยธรรมฯ ใด หรือไม่มีสถานที่วิจัยที่ตรวจสอบได้",
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageTitle
        title="รู้ก่อนเข้าร่วมงานวิจัย"
        sub="การเป็นอาสาสมัครช่วยพัฒนาการรักษาให้คนรุ่นต่อไป แต่คุณควรเข้าใจสิทธิและสิ่งที่จะเกิดขึ้นก่อนตัดสินใจ"
      />

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold">งานวิจัยทางคลินิกคืออะไร</h2>
        <p className="mt-2 leading-relaxed">
          งานวิจัยทางคลินิก (Clinical Research) คือการศึกษาในคน เพื่อหาว่ายา วัคซีน อุปกรณ์การแพทย์ หรือวิธีดูแลสุขภาพแบบใหม่
          ปลอดภัยและได้ผลหรือไม่ ทุกงานวิจัยที่ทำในคนต้องผ่านการพิจารณาจาก
          <strong> คณะกรรมการจริยธรรมการวิจัยในมนุษย์ </strong>
          ก่อนเริ่ม และงานวิจัยจำนวนมากลงทะเบียนในฐานข้อมูลสาธารณะ เช่น ClinicalTrials.gov ซึ่งเป็นแหล่งข้อมูลของเว็บไซต์นี้
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="font-medium">การศึกษาแบบทดลอง</p>
            <p className="mt-1 text-sm text-muted">ผู้เข้าร่วมได้รับยา วิธีรักษา หรือกิจกรรมที่กำลังทดสอบ แล้ววัดผล</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="font-medium">การศึกษาเชิงสังเกต</p>
            <p className="mt-1 text-sm text-muted">เก็บข้อมูลสุขภาพหรือตัวอย่างโดยไม่เปลี่ยนการรักษาที่คุณได้รับ</p>
          </div>
        </div>
      </section>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">ระยะของการทดลองยา</h2>
        <ul className="mt-3 space-y-2">
          {["PHASE1", "PHASE2", "PHASE3", "PHASE4"].map((p) => (
            <li key={p} className="flex gap-3">
              <span className="w-24 shrink-0 font-medium text-primary">{PHASE_TH[p]}</span>
              <span className="text-muted">{PHASE_EXPLAIN[p]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          <strong className="text-ink">ยาหลอก (Placebo)</strong> คือสิ่งที่หน้าตาเหมือนยาแต่ไม่มีตัวยา ใช้เปรียบเทียบผล
          <strong className="text-ink"> การสุ่ม (Randomization)</strong> คือการจับฉลากเลือกกลุ่ม เพื่อให้การเปรียบเทียบยุติธรรม
          ทีมวิจัยต้องบอกคุณล่วงหน้าว่ามีโอกาสได้ยาหลอกหรือไม่
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-semibold">สิทธิของคุณในฐานะอาสาสมัคร</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {RIGHTS.map((r) => (
            <div key={r.t} className="card p-4">
              <p className="font-semibold">✓ {r.t}</p>
              <p className="mt-1 text-[15px] text-muted">{r.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">ค่าตอบแทนและค่าใช้จ่าย</h2>
        <p className="mt-2 leading-relaxed">
          หลายงานวิจัยให้ค่าเดินทางหรือค่าชดเชยเวลาและความไม่สะดวก ซึ่งต้องเหมาะสมและไม่สูงจนเป็นการจูงใจเกินควร
          โดยทั่วไปยาหรือการตรวจที่เป็นส่วนหนึ่งของงานวิจัยไม่ควรเก็บเงินจากคุณ ถามทีมวิจัยให้ชัดเจนว่าอะไรฟรี
          อะไรยังใช้สิทธิการรักษาเดิม และจะได้รับค่าตอบแทนเมื่อไร
        </p>
      </section>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">10 คำถามที่ควรถามทีมวิจัย</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-6">
          {QUESTIONS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-2xl border border-danger/30 bg-danger-soft p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-danger">สัญญาณเตือนที่ควรระวัง</h2>
        <ul className="mt-3 space-y-1.5">
          {RED_FLAGS.map((f) => (
            <li key={f} className="flex gap-2">
              <span aria-hidden>⚠️</span>
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm">
          หากสงสัย ตรวจสอบเลขทะเบียนงานวิจัย (เช่น NCT…) บน ClinicalTrials.gov หรือติดต่อคณะกรรมการจริยธรรมฯ
          ของโรงพยาบาลนั้นโดยตรง
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/screen" className="btn-primary">
          คัดกรองตัวเองเบื้องต้น
        </Link>
        <Link href="/trials" className="btn-ghost">
          ค้นหางานวิจัย
        </Link>
      </div>
    </div>
  );
}
