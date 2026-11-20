import type { Metadata } from "next";
import { type MapSite, MapView } from "@/components/MapView";
import { PageTitle } from "@/components/TrialBits";
import { getTrials } from "@/lib/ctgov";
import { OPEN_STATUSES } from "@/lib/labels";
import { provinceByEn } from "@/lib/provinces";
import { siteDisplayName, siteKey } from "@/lib/stats";

export const metadata: Metadata = { title: "แผนที่ศูนย์วิจัย" };
export const dynamic = "force-dynamic";

export default async function MapPage() {
  const trials = (await getTrials()).filter((t) => OPEN_STATUSES.includes(t.status));
  const sites = new Map<string, MapSite>();

  for (const t of trials) {
    const text = [t.title, ...t.conditions, ...t.keywords, ...t.interventions.map((i) => i.name)].join(" | ").toLowerCase();
    for (const s of t.sites) {
      const key = siteKey(s);
      let site = sites.get(key);
      if (!site) {
        const prov = provinceByEn(s.province);
        const lat = s.lat ?? prov?.lat;
        const lon = s.lon ?? prov?.lon;
        if (lat == null || lon == null) continue;
        site = { key, facility: siteDisplayName(s), province: s.province, lat, lon, approx: s.lat == null, trials: [] };
        sites.set(key, site);
      }
      if (!site.trials.some((x) => x.id === t.id)) {
        site.trials.push({ id: t.id, title: t.title, status: t.status, healthy: t.healthyVolunteers, text });
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTitle
        title="แผนที่ศูนย์วิจัย"
        sub="โรงพยาบาลและศูนย์วิจัยที่มีงานวิจัยเปิดรับหรือกำลังจะเปิดรับ วงกลมยิ่งใหญ่ = ยิ่งมีงานวิจัยมาก"
      />
      <MapView sites={[...sites.values()]} />
    </div>
  );
}
