export type Region = "central" | "north" | "northeast" | "east" | "west" | "south";

export interface Province {
  en: string;
  th: string;
  region: Region;
  lat: number;
  lon: number;
  /** Extra normalized spellings / districts that belong to this province */
  aliases?: string[];
}

export const REGION_TH: Record<Region, string> = {
  central: "ภาคกลาง",
  north: "ภาคเหนือ",
  northeast: "ภาคตะวันออกเฉียงเหนือ",
  east: "ภาคตะวันออก",
  west: "ภาคตะวันตก",
  south: "ภาคใต้",
};

// Coordinates are approximate provincial-capital positions, used only as a
// fallback when a ClinicalTrials.gov site has no usable city/state text.
export const PROVINCES: Province[] = [
  { en: "Bangkok", th: "กรุงเทพมหานคร", region: "central", lat: 13.756, lon: 100.502, aliases: ["ratchatewi", "rachathewi", "rajthevi", "rajthavee", "phathumwan", "pratumwan", "wattana", "bangkojk", "wachiraphayaban", "chulalongkorn", "ramathibodi", "chulabhorn", "bhumibol", "pramongkutklao", "phramongkutklao", "vajira", "bumrungrad", "queensirikit", "kasetsart", "samitivej", "bangkokhospital", "rajavithi", "taksin", "lerdsin", "nopparat", "khlongtoey", "pramongkutlao", 
    "krungthep", "krungthepmahanakhon", "bankok", "bangkoknoi", "bangkokyai", "pathumwan", "patumwan", "ratchathewi",
    "rajathevee", "rajthevee", "phayathai", "payathai", "dusit", "vadhana", "watthana", "bangrak", "bangkapi", "saimai",
    "laksi", "chatuchak", "huaikhwang", "huaykwang", "dindaeng", "bangsue", "phranakhon", "klongtoey", "khlongtoei",
    "sathorn", "sathon", "bangna", "siriraj", "siriaj", "bangkhen", "yannawa", "phasicharoen", "thonburi", "bangphlat",
    "bangkhunthian", "prawet", "minburi", "latkrabang", "ladkrabang", "nongchok", "latphrao", "ladprao", "lardprao",
    "wangthonglang", "chomthong", "bangkholaem", "phrakhanong", "suanluang", "bangkae", "talingchan", "thawiwatthana",
    "nongkhaem", "ratburana", "thungkhru", "bangsue", "ramathibodi", "rajavithi", "phyathai",
  ] },
  { en: "Amnat Charoen", th: "อำนาจเจริญ", region: "northeast", lat: 15.858, lon: 104.626 },
  { en: "Ang Thong", th: "อ่างทอง", region: "central", lat: 14.589, lon: 100.455 },
  { en: "Bueng Kan", th: "บึงกาฬ", region: "northeast", lat: 18.36, lon: 103.646 },
  { en: "Buri Ram", th: "บุรีรัมย์", region: "northeast", lat: 14.993, lon: 103.103 },
  { en: "Chachoengsao", th: "ฉะเชิงเทรา", region: "east", lat: 13.69, lon: 101.077 },
  { en: "Chai Nat", th: "ชัยนาท", region: "central", lat: 15.186, lon: 100.125 },
  { en: "Chaiyaphum", th: "ชัยภูมิ", region: "northeast", lat: 15.806, lon: 102.031 },
  { en: "Chanthaburi", th: "จันทบุรี", region: "east", lat: 12.611, lon: 102.104, aliases: ["chantaburi"] },
  { en: "Chiang Mai", th: "เชียงใหม่", region: "north", lat: 18.788, lon: 98.985, aliases: ["changmai", "nakornchiangmai", "maharajnakorn", 
    "chaingmai", "chiengmai", "sanpatong", "hangdong", "sansai", "saraphi", "maerim", "suthep",
  ] },
  { en: "Chiang Rai", th: "เชียงราย", region: "north", lat: 19.91, lon: 99.84, aliases: ["maefahluang", "chiangrai", "chaingrai", "chiengrai", "maesai", "maechan"] },
  { en: "Chon Buri", th: "ชลบุรี", region: "east", lat: 13.361, lon: 100.985, aliases: ["burapha", "chonburi", "sriracha", "siracha", "banglamung", "pattaya", "bangsaen", "saensuk"] },
  { en: "Chumphon", th: "ชุมพร", region: "south", lat: 10.493, lon: 99.18 },
  { en: "Kalasin", th: "กาฬสินธุ์", region: "northeast", lat: 16.432, lon: 103.506 },
  { en: "Kamphaeng Phet", th: "กำแพงเพชร", region: "north", lat: 16.483, lon: 99.522 },
  { en: "Kanchanaburi", th: "กาญจนบุรี", region: "west", lat: 14.004, lon: 99.548, aliases: ["sangkhlaburi"] },
  { en: "Khon Kaen", th: "ขอนแก่น", region: "northeast", lat: 16.441, lon: 102.836, aliases: ["srinagarind", "srinakarin", "khonkean", "khonkhaen", "phuwiang"] },
  { en: "Krabi", th: "กระบี่", region: "south", lat: 8.086, lon: 98.906 },
  { en: "Lampang", th: "ลำปาง", region: "north", lat: 18.289, lon: 99.49 },
  { en: "Lamphun", th: "ลำพูน", region: "north", lat: 18.574, lon: 99.008 },
  { en: "Loei", th: "เลย", region: "northeast", lat: 17.486, lon: 101.722 },
  { en: "Lop Buri", th: "ลพบุรี", region: "central", lat: 14.799, lon: 100.654 },
  { en: "Mae Hong Son", th: "แม่ฮ่องสอน", region: "north", lat: 19.302, lon: 97.965 },
  { en: "Maha Sarakham", th: "มหาสารคาม", region: "northeast", lat: 16.184, lon: 103.302, aliases: ["mahasarakam"] },
  { en: "Mukdahan", th: "มุกดาหาร", region: "northeast", lat: 16.542, lon: 104.723 },
  { en: "Nakhon Nayok", th: "นครนายก", region: "central", lat: 14.206, lon: 101.213, aliases: ["nakornnayok", "nakhonnavok", "ongkarak", "ongkharak"] },
  { en: "Nakhon Pathom", th: "นครปฐม", region: "central", lat: 13.82, lon: 100.063, aliases: ["nakornphathom", "nakornpathom", "salaya", "phutthamonthon", "buddhamonthon", "kamphaengsaen"] },
  { en: "Nakhon Phanom", th: "นครพนม", region: "northeast", lat: 17.392, lon: 104.769 },
  { en: "Nakhon Ratchasima", th: "นครราชสีมา", region: "northeast", lat: 14.98, lon: 102.098, aliases: ["suranaree", "maharatnakhonratchasima", "korat", "khorat", "nakornratchasima"] },
  { en: "Nakhon Sawan", th: "นครสวรรค์", region: "central", lat: 15.704, lon: 100.137 },
  { en: "Nakhon Si Thammarat", th: "นครศรีธรรมราช", region: "south", lat: 8.432, lon: 99.963, aliases: ["nakhonsrithammarat", "nakornsrithammarat", "walailak", "maharajnakhonsithammarat", "nakornsithammarat"] },
  { en: "Nan", th: "น่าน", region: "north", lat: 18.783, lon: 100.778 },
  { en: "Narathiwat", th: "นราธิวาส", region: "south", lat: 6.426, lon: 101.823 },
  { en: "Nong Bua Lam Phu", th: "หนองบัวลำภู", region: "northeast", lat: 17.204, lon: 102.44 },
  { en: "Nong Khai", th: "หนองคาย", region: "northeast", lat: 17.878, lon: 102.742 },
  { en: "Nonthaburi", th: "นนทบุรี", region: "central", lat: 13.862, lon: 100.514, aliases: ["bangkraso", "centralchest", "nontaburi", "bamrasnaradura", "pakkret", "bangyai", "bangbuathong", "bangkruai"] },
  { en: "Pathum Thani", th: "ปทุมธานี", region: "central", lat: 14.02, lon: 100.525, aliases: ["pathumtani", "thammasat", 
    "patumthani", "khlongluang", "klongluang", "rangsit", "thanyaburi", "lamlukka", "lumlukka", "nongsuea",
  ] },
  { en: "Pattani", th: "ปัตตานี", region: "south", lat: 6.869, lon: 101.25 },
  { en: "Phangnga", th: "พังงา", region: "south", lat: 8.451, lon: 98.525 },
  { en: "Phatthalung", th: "พัทลุง", region: "south", lat: 7.617, lon: 100.078 },
  { en: "Phayao", th: "พะเยา", region: "north", lat: 19.166, lon: 99.902 },
  { en: "Phetchabun", th: "เพชรบูรณ์", region: "north", lat: 16.419, lon: 101.16 },
  { en: "Phetchaburi", th: "เพชรบุรี", region: "west", lat: 13.111, lon: 99.94, aliases: ["phetburi"] },
  { en: "Phichit", th: "พิจิตร", region: "north", lat: 16.442, lon: 100.349 },
  { en: "Phitsanulok", th: "พิษณุโลก", region: "north", lat: 16.821, lon: 100.265, aliases: ["phisanulok", "phitsanuok", "naresuan", "buddhachinaraj", "pitsanulok"] },
  { en: "Phra Nakhon Si Ayutthaya", th: "พระนครศรีอยุธยา", region: "central", lat: 14.353, lon: 100.569, aliases: ["ayutthaya", "ayudhya"] },
  { en: "Phrae", th: "แพร่", region: "north", lat: 18.145, lon: 100.141 },
  { en: "Phuket", th: "ภูเก็ต", region: "south", lat: 7.88, lon: 98.392 },
  { en: "Prachin Buri", th: "ปราจีนบุรี", region: "east", lat: 14.051, lon: 101.372 },
  { en: "Prachuap Khiri Khan", th: "ประจวบคีรีขันธ์", region: "west", lat: 11.812, lon: 99.797, aliases: ["huahin"] },
  { en: "Ranong", th: "ระนอง", region: "south", lat: 9.963, lon: 98.639 },
  { en: "Ratchaburi", th: "ราชบุรี", region: "west", lat: 13.536, lon: 99.817, aliases: ["rachaburi", "banpong", "photharam"] },
  { en: "Rayong", th: "ระยอง", region: "east", lat: 12.681, lon: 101.278 },
  { en: "Roi Et", th: "ร้อยเอ็ด", region: "northeast", lat: 16.054, lon: 103.653 },
  { en: "Sa Kaeo", th: "สระแก้ว", region: "east", lat: 13.814, lon: 102.072, aliases: ["sakaew", "aranyaprathet"] },
  { en: "Sakon Nakhon", th: "สกลนคร", region: "northeast", lat: 17.155, lon: 104.14 },
  { en: "Samut Prakan", th: "สมุทรปราการ", region: "central", lat: 13.599, lon: 100.597, aliases: [
    "samutprakarn", "bangphli", "bangplee", "phrapradaeng", "bangbo", "bangsaothong",
  ] },
  { en: "Samut Sakhon", th: "สมุทรสาคร", region: "central", lat: 13.548, lon: 100.274, aliases: ["samutsakorn", "banphaeo", "banpaeo", "krathumbaen", "mahachai"] },
  { en: "Samut Songkhram", th: "สมุทรสงคราม", region: "central", lat: 13.409, lon: 100.002 },
  { en: "Saraburi", th: "สระบุรี", region: "central", lat: 14.528, lon: 100.91 },
  { en: "Satun", th: "สตูล", region: "south", lat: 6.624, lon: 100.067 },
  { en: "Si Sa Ket", th: "ศรีสะเกษ", region: "northeast", lat: 15.118, lon: 104.322, aliases: ["srisaket"] },
  { en: "Sing Buri", th: "สิงห์บุรี", region: "central", lat: 14.891, lon: 100.397 },
  { en: "Songkhla", th: "สงขลา", region: "south", lat: 7.199, lon: 100.595, aliases: ["songklanagarind", "songkla", "princeofsongkla", "hatyai", "hadyai", "singhanakhon"] },
  { en: "Sukhothai", th: "สุโขทัย", region: "north", lat: 17.007, lon: 99.823 },
  { en: "Suphan Buri", th: "สุพรรณบุรี", region: "central", lat: 14.474, lon: 100.117 },
  { en: "Surat Thani", th: "สุราษฎร์ธานี", region: "south", lat: 9.14, lon: 99.333 },
  { en: "Surin", th: "สุรินทร์", region: "northeast", lat: 14.883, lon: 103.494 },
  { en: "Tak", th: "ตาก", region: "west", lat: 16.884, lon: 99.126, aliases: ["maesot", "maeramat", "phopphra", "umphang", "thasongyang"] },
  { en: "Trang", th: "ตรัง", region: "south", lat: 7.557, lon: 99.611 },
  { en: "Trat", th: "ตราด", region: "east", lat: 12.243, lon: 102.517 },
  { en: "Ubon Ratchathani", th: "อุบลราชธานี", region: "northeast", lat: 15.244, lon: 104.848, aliases: ["ubonrachathani", "warinchamrap"] },
  { en: "Udon Thani", th: "อุดรธานี", region: "northeast", lat: 17.415, lon: 102.787, aliases: ["udornthani"] },
  { en: "Uthai Thani", th: "อุทัยธานี", region: "central", lat: 15.379, lon: 100.024 },
  { en: "Uttaradit", th: "อุตรดิตถ์", region: "north", lat: 17.626, lon: 100.099 },
  { en: "Yala", th: "ยะลา", region: "south", lat: 6.54, lon: 101.281 },
  { en: "Yasothon", th: "ยโสธร", region: "northeast", lat: 15.794, lon: 104.145 },
];

const BY_EN = new Map(PROVINCES.map((p) => [p.en, p]));

export function provinceByEn(en: string | null | undefined): Province | undefined {
  return en ? BY_EN.get(en) : undefined;
}

export function provinceTh(en: string | null | undefined): string {
  return provinceByEn(en)?.th ?? "ไม่ระบุจังหวัด";
}

const NOISE = /\b(changwat|amphoe|amphur|amphoe|province|provinc|district|thailand|metropolis|metropolitan|city|nai|mueang|muang|tambon|thai)\b/g;

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\[.*?\]/g, " ")
    .replace(NOISE, " ")
    .replace(/[^a-z]/g, "");
}

// alias -> province en
const ALIASES: [string, string][] = [];
for (const p of PROVINCES) {
  ALIASES.push([norm(p.en), p.en]);
  for (const a of p.aliases ?? []) ALIASES.push([a, p.en]);
}
const EXACT = new Map(ALIASES);
// Substring matching only for aliases long enough not to collide.
const CONTAINS = ALIASES.filter(([a]) => a.length >= 6).sort((a, b) => b[0].length - a[0].length);

function matchText(raw: string): string | null {
  const n = norm(raw);
  if (!n) return null;
  const exact = EXACT.get(n);
  if (exact) return exact;
  for (const [alias, en] of CONTAINS) if (n.includes(alias)) return en;
  return null;
}

function nearest(lat: number, lon: number): string | null {
  let best: Province | null = null;
  let bestD = Infinity;
  for (const p of PROVINCES) {
    const d = (p.lat - lat) ** 2 + ((p.lon - lon) * Math.cos((lat * Math.PI) / 180)) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  // ~0.8 degrees ≈ 90 km; beyond that the point is probably mis-geocoded.
  return best && bestD < 0.64 ? best.en : null;
}

/** Resolve a ClinicalTrials.gov location to a Thai province key. */
export function resolveProvince(
  city?: string,
  state?: string,
  lat?: number,
  lon?: number,
  facility?: string,
): string | null {
  return (
    (state && matchText(state)) ||
    (city && matchText(city)) ||
    (lat != null && lon != null ? nearest(lat, lon) : null) ||
    // Last resort: hospital names often contain the province ("Khon Kaen Hospital").
    (facility && matchText(facility)) ||
    null
  );
}
