import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { ProvinceSelect } from "@/components/ProvinceSelect";
import { TrialCard } from "@/components/TrialBits";
import { getDataset } from "@/lib/ctgov";
import { num, thDateTime } from "@/lib/format";
import { OPEN_STATUSES } from "@/lib/labels";
import { POPULAR_TOPICS } from "@/lib/thai-terms";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getDataset();
  const open = data.trials.filter((t) => OPEN_STATUSES.includes(t.status));
  const recruiting = open.filter((t) => t.status === "RECRUITING");
  const sites = new Set(open.flatMap((t) => t.sites.map((s) => s.facility.toLowerCase())));
  const provinces = new Set(open.flatMap((t) => t.sites.map((s) => s.province).filter(Boolean)));
  const healthy = open.filter((t) => t.healthyVolunteers).length;
  const latest = [...recruiting].sort((a, b) => (b.firstPosted ?? "").localeCompare(a.firstPosted ?? "")).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="hero-bg border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-sm font-medium text-primary">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-primary" /></span>
            มี {num(open.length)} งานวิจัยที่เปิดหรือกำลังจะเปิดรับอาสาสมัครในไทย
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.2] tracking-tight sm:text-5xl">
            ค้นหางานวิจัยทางการแพทย์
            <br />
            ที่เปิดรับอาสาสมัคร<span className="text-primary">ใกล้บ้านคุณ</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">
            พิมพ์ชื่อโรคเป็นภาษาไทยได้เลย ระบบจะค้นจากทะเบียนงานวิจัย ClinicalTrials.gov ให้
            พร้อมอธิบายเกณฑ์รับสมัครเป็นภาษาที่เข้าใจง่าย
          </p>

          <form action="/trials" className="mt-8 grid max-w-4xl gap-2 rounded-2xl border border-line bg-surface p-2 shadow-[0_12px_40px_-20px_rgba(13,107,92,0.45)] sm:grid-cols-[1fr_220px_auto]">
            <label className="sr-only" htmlFor="q">
              โรคหรือคำค้น
            </label>
            <input id="q" name="q" className="field border-transparent py-3 text-base" placeholder="พิมพ์ชื่อโรค เช่น เบาหวาน, มะเร็งเต้านม, วัคซีน" />
            <label className="sr-only" htmlFor="province">
              จังหวัด
            </label>
            <ProvinceSelect id="province" className="field border-transparent bg-surface-2 py-3 text-base" />
            <button className="btn-primary px-6 py-3 text-base">
              <Icon name="search" className="size-5" />
              ค้นหา
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">หัวข้อยอดนิยม</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {POPULAR_TOPICS.map((t) => (
              <Link key={t.q} href={`/trials?q=${encodeURIComponent(t.q)}`} className="chip">
                <span aria-hidden>{t.icon}</span>
                {t.th}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* Stats */}
        <section className="relative z-10 -mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(
            [
              { v: recruiting.length, l: "กำลังรับอาสาสมัคร", i: "pulse" },
              { v: healthy, l: "รับคนสุขภาพดี", i: "heart" },
              { v: sites.size, l: "ศูนย์วิจัย/โรงพยาบาล", i: "building" },
              { v: provinces.size, l: "จังหวัด", i: "pin" },
            ] satisfies { v: number; l: string; i: IconName }[]
          ).map((s) => (
            <div key={s.l} className="card flex items-center gap-3 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon name={s.i} className="size-5" />
              </span>
              <span>
                <span className="block text-2xl font-bold tabular-nums sm:text-3xl">{num(s.v)}</span>
                <span className="block text-sm text-muted">{s.l}</span>
              </span>
            </div>
          ))}
        </section>

        {/* Features */}
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            {
              href: "/screen",
              title: "คัดกรองตัวเองเบื้องต้น",
              body: "ตอบคำถาม 5 ข้อ (อายุ เพศ จังหวัด โรคที่เป็น) แล้วดูว่างานวิจัยไหนน่าจะเหมาะกับคุณ",
              cta: "เริ่มคัดกรอง",
              icon: "clipboard" as IconName,
            },
            {
              href: "/map",
              title: "แผนที่ศูนย์วิจัย",
              body: "ดูโรงพยาบาลและศูนย์วิจัยที่กำลังรับอาสาสมัคร เลือกที่ใกล้บ้านที่สุด",
              cta: "เปิดแผนที่",
              icon: "map" as IconName,
            },
            {
              href: "/alerts",
              title: "แจ้งเตือนผ่าน LINE",
              body: "บอกเราว่าสนใจโรคอะไร เมื่อมีงานวิจัยใหม่เปิดรับ เราจะส่งข้อความหาคุณ",
              cta: "ตั้งค่าแจ้งเตือน",
              icon: "bell" as IconName,
            },
            {
              href: "/learn",
              title: "รู้ก่อนเข้าร่วมงานวิจัย",
              body: "สิทธิของอาสาสมัคร การยินยอม การถอนตัว ค่าตอบแทน และคำถามที่ควรถามทีมวิจัย",
              cta: "อ่านเพิ่มเติม",
              icon: "book" as IconName,
            },
          ].map((f) => (
            <Link key={f.href} href={f.href} className="card card-hover group flex gap-4 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-[var(--primary-2)] text-primary-ink shadow-sm">
                <Icon name={f.icon} className="size-6" />
              </span>
              <span>
                <span className="block text-lg font-semibold group-hover:text-primary">{f.title}</span>
                <span className="mt-1 block text-muted">{f.body}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {f.cta}
                  <Icon name="arrow" className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          ))}
        </section>

        {/* Latest */}
        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-bold">เพิ่งเปิดรับล่าสุด</h2>
            <Link href="/trials" className="text-sm font-medium text-primary">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {latest.map((t) => (
              <TrialCard key={t.id} t={t} />
            ))}
          </div>
          <p className="mt-6 text-xs text-muted">อัปเดตข้อมูลล่าสุด {thDateTime(data.fetchedAt)}</p>
        </section>
      </div>
    </div>
  );
}
