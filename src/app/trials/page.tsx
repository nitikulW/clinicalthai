import type { Metadata } from "next";
import Link from "next/link";
import { ProvinceSelect } from "@/components/ProvinceSelect";
import { PageTitle, Pagination, TrialCard } from "@/components/TrialBits";
import { getTrials } from "@/lib/ctgov";
import { num } from "@/lib/format";
import { PHASE_ORDER, PHASE_TH } from "@/lib/labels";
import { one, parseFilter, parseSort, qs, spToRecord } from "@/lib/params";
import { provinceTh } from "@/lib/provinces";
import { filterTrials, sortTrials } from "@/lib/search";
import { expandQuery } from "@/lib/thai-terms";

export const metadata: Metadata = { title: "ค้นหางานวิจัย" };

const PER_PAGE = 20;

export default async function TrialsPage({ searchParams }: PageProps<"/trials">) {
  const sp = await searchParams;
  const filter = parseFilter(sp, { status: "open" });
  const sort = parseSort(sp);
  const all = await getTrials();
  const results = sortTrials(filterTrials(all, filter), sort);
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const shown = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const base = spToRecord(sp);
  const concepts = expandQuery(filter.q ?? "");
  const unknownThai = filter.q && /[฀-๿]/.test(filter.q) && concepts.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTitle
        title="ค้นหางานวิจัย"
        sub={
          <>
            พบ <strong className="text-ink">{num(results.length)}</strong> งานวิจัย
            {filter.q && <> สำหรับ “{filter.q}”</>}
            {filter.province && <> ใน{provinceTh(filter.province)}</>}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <form className="card h-fit space-y-4 p-4 lg:sticky lg:top-32">
          <div>
            <label className="label" htmlFor="f-q">
              โรค / คำค้น
            </label>
            <input id="f-q" name="q" defaultValue={filter.q} className="field" placeholder="เช่น เบาหวาน" />
          </div>
          <div>
            <label className="label" htmlFor="f-province">
              จังหวัด
            </label>
            <ProvinceSelect id="f-province" defaultValue={filter.province} />
          </div>
          <div>
            <label className="label" htmlFor="f-status">
              สถานะ
            </label>
            <select id="f-status" name="status" defaultValue={filter.status} className="field">
              <option value="open">เปิดรับ + กำลังจะเปิด</option>
              <option value="RECRUITING">กำลังรับอาสาสมัครเท่านั้น</option>
              <option value="NOT_YET_RECRUITING">กำลังจะเปิดรับ</option>
              <option value="all">ทุกสถานะ (รวมที่ปิดแล้ว)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label" htmlFor="f-age">
                อายุ (ปี)
              </label>
              <input id="f-age" name="age" type="number" min={0} max={120} defaultValue={filter.age} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="f-sex">
                เพศ
              </label>
              <select id="f-sex" name="sex" defaultValue={filter.sex ?? ""} className="field">
                <option value="">ไม่ระบุ</option>
                <option value="FEMALE">หญิง</option>
                <option value="MALE">ชาย</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="f-phase">
              ระยะการทดลอง
            </label>
            <select id="f-phase" name="phase" defaultValue={filter.phase ?? ""} className="field">
              <option value="">ทุกระยะ</option>
              {PHASE_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PHASE_TH[p]}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-[15px]">
            <input type="checkbox" name="healthy" value="1" defaultChecked={filter.healthy} className="size-4 accent-primary" />
            รับอาสาสมัครสุขภาพดี
          </label>
          <div>
            <label className="label" htmlFor="f-sort">
              เรียงตาม
            </label>
            <select id="f-sort" name="sort" defaultValue={sort} className="field">
              <option value="recent">กำลังรับก่อน / ใหม่ล่าสุด</option>
              <option value="updated">อัปเดตล่าสุด</option>
              <option value="start">วันเริ่มศึกษา</option>
              <option value="enrollment">จำนวนอาสาสมัครที่ต้องการ</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary flex-1">ค้นหา</button>
            <Link href="/trials" className="btn-ghost">
              ล้าง
            </Link>
          </div>
        </form>

        {/* Results */}
        <section>
          {concepts.length > 0 && (
            <p className="mb-3 text-sm text-muted">
              ค้นหาด้วยคำ:{" "}
              {concepts.map((c, i) => (
                <span key={i}>
                  {i > 0 && " และ "}
                  <span className="text-ink">{c.slice(0, 4).join(" / ")}</span>
                  {c.length > 4 && " …"}
                </span>
              ))}
            </p>
          )}
          {unknownThai && (
            <p className="mb-4 rounded-lg bg-warn-soft p-3 text-sm text-warn">
              ยังไม่รู้จักคำว่า “{filter.q}” — ข้อมูลงานวิจัยเป็นภาษาอังกฤษ ลองใช้ชื่อโรคทั่วไป หรือพิมพ์เป็นภาษาอังกฤษ
            </p>
          )}
          {shown.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-lg font-medium">ไม่พบงานวิจัยที่ตรงกับเงื่อนไข</p>
              <p className="mt-1 text-muted">ลองลดตัวกรอง เช่น เลือก “ทุกจังหวัด” หรือเปลี่ยนคำค้น</p>
              <Link href="/alerts" className="btn-primary mt-4">
                🔔 แจ้งเตือนฉันเมื่อมีงานวิจัยใหม่
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {shown.map((t) => (
                <TrialCard key={t.id} t={t} highlightProvince={filter.province} />
              ))}
            </div>
          )}
          <Pagination page={page} pages={pages} href={(p) => `/trials${qs({ ...base, page: p === 1 ? undefined : p })}`} />
        </section>
      </div>
    </div>
  );
}
