import Link from "next/link";
import { INTERVENTION_TH, PHASE_ORDER, PHASE_TH, SPONSOR_CLASS_TH, STATUS_TH, STUDY_TYPE_TH } from "@/lib/labels";
import type { TrialFilter } from "@/lib/search";
import { ProvinceSelect } from "./ProvinceSelect";

const STATUS_OPTS = ["RECRUITING", "NOT_YET_RECRUITING", "ACTIVE_NOT_RECRUITING", "COMPLETED", "TERMINATED", "WITHDRAWN", "UNKNOWN"];
const CLASS_OPTS = ["INDUSTRY", "OTHER", "OTHER_GOV", "NIH", "NETWORK", "FED", "INDIV"];

export function ResearchFilters({
  f,
  action,
  hidden = {},
  resetHref,
}: {
  f: TrialFilter;
  action: string;
  hidden?: Record<string, string | undefined>;
  resetHref: string;
}) {
  const thisYear = new Date().getFullYear();
  return (
    <form action={action} className="card mb-6 grid grid-cols-2 gap-3 p-4 md:grid-cols-4 lg:grid-cols-6">
      {Object.entries(hidden).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
      <div className="col-span-2">
        <label className="label" htmlFor="r-q">
          โรค / ยา / คำค้น (ไทยหรืออังกฤษ)
        </label>
        <input id="r-q" name="q" defaultValue={f.q} className="field" placeholder="เช่น มะเร็งปอด, pembrolizumab" />
      </div>
      <div className="col-span-2">
        <label className="label" htmlFor="r-sponsor">
          ผู้สนับสนุน
        </label>
        <input id="r-sponsor" name="sponsor" defaultValue={f.sponsor} className="field" placeholder="เช่น AstraZeneca, Mahidol" />
      </div>
      <div>
        <label className="label" htmlFor="r-status">
          สถานะ
        </label>
        <select id="r-status" name="status" defaultValue={f.status} className="field">
          <option value="all">ทั้งหมด</option>
          <option value="open">เปิดรับ + กำลังจะเปิด</option>
          {STATUS_OPTS.map((s) => (
            <option key={s} value={s}>
              {STATUS_TH[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="r-class">
          ประเภทผู้สนับสนุน
        </label>
        <select id="r-class" name="sponsorClass" defaultValue={f.sponsorClass ?? ""} className="field">
          <option value="">ทั้งหมด</option>
          {CLASS_OPTS.map((s) => (
            <option key={s} value={s}>
              {SPONSOR_CLASS_TH[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="r-phase">
          ระยะ
        </label>
        <select id="r-phase" name="phase" defaultValue={f.phase ?? ""} className="field">
          <option value="">ทุกระยะ</option>
          {PHASE_ORDER.map((p) => (
            <option key={p} value={p}>
              {PHASE_TH[p]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="r-type">
          ประเภทการศึกษา
        </label>
        <select id="r-type" name="studyType" defaultValue={f.studyType ?? ""} className="field">
          <option value="">ทั้งหมด</option>
          {Object.entries(STUDY_TYPE_TH).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="r-int">
          สิ่งที่ทดสอบ
        </label>
        <select id="r-int" name="interventionType" defaultValue={f.interventionType ?? ""} className="field">
          <option value="">ทั้งหมด</option>
          {Object.entries(INTERVENTION_TH).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="r-prov">
          จังหวัด
        </label>
        <ProvinceSelect id="r-prov" defaultValue={f.province} />
      </div>
      <div>
        <label className="label" htmlFor="r-y1">
          เริ่มตั้งแต่ปี (ค.ศ.)
        </label>
        <input id="r-y1" name="yearFrom" type="number" min={1990} max={thisYear + 3} defaultValue={f.yearFrom} className="field" placeholder="2015" />
      </div>
      <div>
        <label className="label" htmlFor="r-y2">
          ถึงปี (ค.ศ.)
        </label>
        <input id="r-y2" name="yearTo" type="number" min={1990} max={thisYear + 3} defaultValue={f.yearTo} className="field" placeholder={String(thisYear)} />
      </div>
      <div className="col-span-2 flex items-end gap-2 md:col-span-2">
        <button className="btn-primary flex-1">ใช้ตัวกรอง</button>
        <Link href={resetHref} className="btn-ghost">
          ล้าง
        </Link>
      </div>
    </form>
  );
}
