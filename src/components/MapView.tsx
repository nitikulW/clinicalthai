"use client";

import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { STATUS_TH } from "@/lib/labels";
import { PROVINCES, provinceByEn } from "@/lib/provinces";
import { textMatches } from "@/lib/search";
import { expandQuery } from "@/lib/thai-terms";

export interface MapSite {
  key: string;
  facility: string;
  province: string | null;
  lat: number;
  lon: number;
  /** true when positioned at the province centre (no geocode in the registry) */
  approx: boolean;
  trials: { id: string; title: string; status: string; healthy: boolean; text: string }[];
}

const PROVINCES_TH = [...PROVINCES].sort((a, b) => a.th.localeCompare(b.th, "th"));

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function km(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function MapView({ sites }: { sites: MapSite[] }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const markers = useRef(new Map<string, Leaflet.CircleMarker>());
  const [L, setL] = useState<typeof Leaflet | null>(null);
  const [q, setQ] = useState("");
  const [healthy, setHealthy] = useState(false);
  const [me, setMe] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Filtered view: each site keeps only the trials that match.
  const visible = useMemo(() => {
    const concepts = expandQuery(q);
    const list = sites
      .map((s) => ({
        ...s,
        trials: s.trials.filter((t) => (!healthy || t.healthy) && (!concepts.length || textMatches(t.text, concepts))),
      }))
      .filter((s) => s.trials.length > 0)
      .map((s) => ({ ...s, dist: me ? km(me.lat, me.lon, s.lat, s.lon) : undefined }));
    return list.sort((a, b) => (me ? a.dist! - b.dist! : b.trials.length - a.trials.length));
  }, [sites, q, healthy, me]);

  const totalTrials = useMemo(() => new Set(visible.flatMap((s) => s.trials.map((t) => t.id))).size, [visible]);

  // Init map once.
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || mapRef.current) return;
      const Lf = (mod.default ?? mod) as typeof Leaflet;
      const map = Lf.map(el.current, { zoomControl: true, scrollWheelZoom: false }).setView([13.2, 101.0], 6);
      Lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      map.on("focus", () => map.scrollWheelZoom.enable());
      map.on("blur", () => map.scrollWheelZoom.disable());
      mapRef.current = map;
      layerRef.current = Lf.layerGroup().addTo(map);
      setL(Lf);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw markers when the filter changes.
  useEffect(() => {
    if (!L || !layerRef.current) return;
    const layer = layerRef.current;
    layer.clearLayers();
    markers.current.clear();
    const color = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#0d6b5c";
    for (const s of visible) {
      const n = s.trials.length;
      const m = L.circleMarker([s.lat, s.lon], {
        radius: Math.min(26, 6 + Math.sqrt(n) * 3.5),
        color: "#fff",
        weight: 2,
        fillColor: color,
        fillOpacity: s.approx ? 0.45 : 0.8,
      });
      const items = s.trials
        .slice(0, 8)
        .map(
          (t) =>
            `<li style="margin:4px 0"><a href="/trials/${t.id}" style="color:${color};text-decoration:underline">${esc(t.title)}</a><br><small>${esc(STATUS_TH[t.status] ?? t.status)}</small></li>`,
        )
        .join("");
      m.bindPopup(
        `<div style="max-width:280px"><strong>${esc(s.facility)}</strong><br><small>${esc(provinceByEn(s.province)?.th ?? "")}${
          s.approx ? " · ตำแหน่งโดยประมาณ" : ""
        }</small><ul style="padding-left:16px;margin:6px 0">${items}</ul>${
          n > 8 ? `<small>และอีก ${n - 8} งาน</small>` : ""
        }</div>`,
      );
      m.bindTooltip(`${s.facility} (${n})`);
      m.addTo(layer);
      markers.current.set(s.key, m);
    }
  }, [L, visible]);

  function focusSite(s: MapSite) {
    const m = markers.current.get(s.key);
    mapRef.current?.flyTo([s.lat, s.lon], 12, { duration: 0.8 });
    setTimeout(() => m?.openPopup(), 850);
    el.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function goProvince(en: string) {
    const p = provinceByEn(en);
    if (p) mapRef.current?.flyTo([p.lat, p.lon], 10, { duration: 0.8 });
    else mapRef.current?.flyTo([13.2, 101.0], 6);
  }

  function locate() {
    setGeoError(null);
    if (!navigator.geolocation) return setGeoError("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setMe(p);
        mapRef.current?.flyTo([p.lat, p.lon], 10, { duration: 0.8 });
      },
      () => setGeoError("ไม่สามารถระบุตำแหน่งได้ (อาจไม่ได้อนุญาต)"),
      { timeout: 10000 },
    );
  }

  return (
    <div className="space-y-4">
      <div className="card grid gap-3 p-4 sm:grid-cols-[1fr_200px_auto_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="m-q">
            โรค / คำค้น
          </label>
          <input id="m-q" value={q} onChange={(e) => setQ(e.target.value)} className="field" placeholder="เช่น มะเร็ง, เบาหวาน" />
        </div>
        <div>
          <label className="label" htmlFor="m-prov">
            ไปที่จังหวัด
          </label>
          <select id="m-prov" className="field" defaultValue="" onChange={(e) => goProvince(e.target.value)}>
            <option value="">ทั้งประเทศ</option>
            {PROVINCES_TH.map((p) => (
              <option key={p.en} value={p.en}>
                {p.th}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 pb-2 text-[15px]">
          <input type="checkbox" checked={healthy} onChange={(e) => setHealthy(e.target.checked)} className="size-4 accent-primary" />
          รับคนสุขภาพดี
        </label>
        <button type="button" onClick={locate} className="btn-ghost">
          📍 ใกล้ฉัน
        </button>
      </div>
      {geoError && <p className="text-sm text-danger">{geoError}</p>}

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div
          ref={el}
          className="h-[60vh] min-h-[380px] overflow-hidden rounded-2xl border border-line bg-surface-2"
          role="region"
          aria-label="แผนที่ศูนย์วิจัย"
        />
        <div className="card flex max-h-[60vh] min-h-[380px] flex-col">
          <p className="border-b border-line px-4 py-3 text-sm text-muted">
            {visible.length} ศูนย์ · {totalTrials} งานวิจัย {me && "· เรียงจากใกล้ที่สุด"}
          </p>
          <ul className="flex-1 divide-y divide-line overflow-y-auto">
            {visible.slice(0, 150).map((s) => (
              <li key={s.key}>
                <button onClick={() => focusSite(s)} className="w-full px-4 py-3 text-left hover:bg-surface-2">
                  <span className="block font-medium leading-snug">{s.facility}</span>
                  <span className="block text-sm text-muted">
                    {provinceByEn(s.province)?.th ?? "ไม่ระบุจังหวัด"} · {s.trials.length} งานวิจัย
                    {s.dist != null && ` · ${s.dist < 10 ? s.dist.toFixed(1) : Math.round(s.dist)} กม.`}
                  </span>
                </button>
              </li>
            ))}
            {visible.length === 0 && <li className="p-4 text-muted">ไม่พบศูนย์วิจัยที่ตรงกับเงื่อนไข</li>}
          </ul>
        </div>
      </div>
      <p className="text-xs text-muted">
        วงกลมสีจาง = ทะเบียนไม่ได้ระบุพิกัด จึงแสดงที่ตัวจังหวัดโดยประมาณ ·{" "}
        <Link href="/trials" className="underline">
          ดูเป็นรายการ
        </Link>
      </p>
    </div>
  );
}
