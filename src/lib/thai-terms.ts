/**
 * Thai → English medical search terms. ClinicalTrials.gov records are in
 * English, so a Thai query is expanded into English terms before matching.
 * Keys are matched longest-first so "มะเร็งเต้านม" wins over "มะเร็ง".
 */
export const THAI_TERMS: Record<string, string[]> = {
  "มะเร็งเต้านม": ["breast cancer", "breast neoplasm", "breast carcinoma"],
  "มะเร็งปอด": ["lung cancer", "lung neoplasm", "nsclc", "non-small cell lung", "small cell lung"],
  "มะเร็งตับ": ["liver cancer", "hepatocellular", "hcc"],
  "มะเร็งท่อน้ำดี": ["cholangiocarcinoma", "biliary tract cancer", "bile duct cancer"],
  "มะเร็งลำไส้": ["colorectal", "colon cancer", "rectal cancer"],
  "มะเร็งปากมดลูก": ["cervical cancer", "cervical neoplasm", "cervical intraepithelial"],
  "มะเร็งรังไข่": ["ovarian cancer"],
  "มะเร็งต่อมลูกหมาก": ["prostate cancer"],
  "มะเร็งกระเพาะ": ["gastric cancer", "stomach cancer"],
  "มะเร็งโพรงจมูก": ["nasopharyngeal"],
  "มะเร็งเม็ดเลือดขาว": ["leukemia", "leukaemia"],
  "มะเร็งต่อมน้ำเหลือง": ["lymphoma"],
  "มะเร็งศีรษะและลำคอ": ["head and neck cancer", "head and neck squamous"],
  "มะเร็ง": ["cancer", "carcinoma", "neoplasm", "tumor", "tumour", "lymphoma", "leukemia", "myeloma", "sarcoma", "oncology"],
  "เบาหวานขึ้นจอตา": ["diabetic retinopathy", "diabetic macular"],
  "เบาหวาน": ["diabetes", "diabetic", "glycemic", "insulin"],
  "ความดันโลหิตสูง": ["hypertension", "blood pressure"],
  "ความดัน": ["hypertension", "blood pressure"],
  "ไขมันในเลือดสูง": ["dyslipidemia", "hypercholesterolemia", "hyperlipidemia", "cholesterol"],
  "ไขมัน": ["dyslipidemia", "hypercholesterolemia", "hyperlipidemia", "cholesterol"],
  "หัวใจล้มเหลว": ["heart failure"],
  "หัวใจ": ["heart", "cardiac", "coronary", "cardiovascular", "myocardial", "atrial fibrillation"],
  "หลอดเลือดสมอง": ["stroke", "cerebrovascular"],
  "อัมพาต": ["stroke", "paralysis", "hemiplegia"],
  "ไตวายเรื้อรัง": ["chronic kidney disease", "ckd", "end stage renal", "dialysis"],
  "ล้างไต": ["dialysis", "hemodialysis", "peritoneal dialysis"],
  "ไต": ["kidney", "renal", "nephro"],
  "ไวรัสตับอักเสบบี": ["hepatitis b", "hbv"],
  "ไวรัสตับอักเสบซี": ["hepatitis c", "hcv"],
  "ตับอักเสบ": ["hepatitis"],
  "ไขมันพอกตับ": ["fatty liver", "nafld", "nash", "masld", "mash", "steatohepatitis"],
  "พยาธิใบไม้ตับ": ["opisthorchis", "liver fluke"],
  "ตับ": ["liver", "hepatic", "cirrhosis"],
  "เอชไอวี": ["hiv"],
  "เอดส์": ["hiv", "aids"],
  "เพร็พ": ["prep", "pre-exposure prophylaxis"],
  "วัณโรค": ["tuberculosis"],
  "มาลาเรีย": ["malaria", "plasmodium"],
  "ไข้เลือดออก": ["dengue"],
  "โควิด": ["covid", "sars-cov-2", "coronavirus"],
  "ไข้หวัดใหญ่": ["influenza"],
  "ปอดอักเสบ": ["pneumonia"],
  "ติดเชื้อในกระแสเลือด": ["sepsis", "septic", "bacteremia"],
  "เมลิออยด์": ["melioidosis", "burkholderia"],
  "พิษสุนัขบ้า": ["rabies"],
  "วัคซีน": ["vaccine", "immunogenicity"],
  "หอบหืด": ["asthma"],
  "ปอดอุดกั้นเรื้อรัง": ["copd", "chronic obstructive"],
  "ภูมิแพ้": ["allergy", "allergic", "rhinitis"],
  "ซึมเศร้า": ["depression", "depressive"],
  "วิตกกังวล": ["anxiety"],
  "นอนไม่หลับ": ["insomnia", "sleep"],
  "จิตเภท": ["schizophrenia", "psychosis"],
  "ไบโพลาร์": ["bipolar"],
  "สมาธิสั้น": ["adhd", "attention deficit"],
  "ออทิสติก": ["autism", "autistic"],
  "สมองเสื่อม": ["dementia", "alzheimer", "cognitive impairment"],
  "อัลไซเมอร์": ["alzheimer", "dementia"],
  "พาร์กินสัน": ["parkinson"],
  "ลมชัก": ["epilepsy", "seizure"],
  "ไมเกรน": ["migraine", "headache"],
  "ปวดหลัง": ["back pain", "lumbar", "spinal"],
  "ข้อเข่าเสื่อม": ["knee osteoarthritis", "osteoarthritis"],
  "ข้อเสื่อม": ["osteoarthritis"],
  "กระดูกพรุน": ["osteoporosis", "bone mineral density"],
  "รูมาตอยด์": ["rheumatoid arthritis"],
  "เกาต์": ["gout", "uric acid"],
  "เก๊าท์": ["gout", "uric acid"],
  "เอสแอลอี": ["lupus", "sle"],
  "สะเก็ดเงิน": ["psoriasis"],
  "ผื่นภูมิแพ้ผิวหนัง": ["atopic dermatitis", "eczema"],
  "สิว": ["acne"],
  "ผิวหนัง": ["skin", "dermatitis", "dermatology"],
  "โรคอ้วน": ["obesity", "overweight", "weight loss"],
  "อ้วน": ["obesity", "overweight", "weight loss"],
  "ลดน้ำหนัก": ["weight loss", "obesity"],
  "ธาลัสซีเมีย": ["thalassemia", "thalassaemia"],
  "โลหิตจาง": ["anemia", "anaemia"],
  "ฮีโมฟีเลีย": ["hemophilia", "haemophilia"],
  "ต้อกระจก": ["cataract"],
  "ต้อหิน": ["glaucoma"],
  "จอตา": ["retina", "retinal", "macular"],
  "ตา": ["eye", "ocular", "ophthalm", "vision"],
  "ฟัน": ["dental", "tooth", "teeth", "periodont", "orthodont", "caries"],
  "ช่องปาก": ["oral", "dental", "periodont", "mouth"],
  "ตั้งครรภ์": ["pregnancy", "pregnant", "antenatal", "prenatal", "obstetric"],
  "คนท้อง": ["pregnancy", "pregnant", "antenatal"],
  "คลอด": ["labor", "delivery", "cesarean", "postpartum"],
  "ทารกคลอดก่อนกำหนด": ["preterm", "premature infant"],
  "ทารก": ["infant", "neonat", "newborn"],
  "เด็ก": ["child", "pediatric", "paediatric", "adolescent"],
  "ผู้สูงอายุ": ["elderly", "older adult", "aging", "geriatric"],
  "มีบุตรยาก": ["infertility", "ivf", "in vitro fertilization"],
  "วัยทอง": ["menopause", "postmenopausal"],
  "ปวดประจำเดือน": ["dysmenorrhea"],
  "ต่อมลูกหมากโต": ["benign prostatic hyperplasia", "bph"],
  "นิ่ว": ["stone", "calculi", "urolithiasis"],
  "ไทรอยด์": ["thyroid"],
  "กรดไหลย้อน": ["gastroesophageal reflux", "gerd"],
  "ลำไส้แปรปรวน": ["irritable bowel", "ibs"],
  "ท้องเสีย": ["diarrhea", "diarrhoea"],
  "ท้องผูก": ["constipation"],
  "ผ่าตัด": ["surgery", "surgical", "postoperative", "perioperative"],
  "ระงับความรู้สึก": ["anesthesia", "anaesthesia", "nerve block"],
  "ดมยา": ["anesthesia", "anaesthesia"],
  "ปวด": ["pain", "analgesi"],
  "บุหรี่": ["smoking", "tobacco", "nicotine", "cigarette"],
  "บุหรี่ไฟฟ้า": ["e-cigarette", "vaping"],
  "แอลกอฮอล์": ["alcohol"],
  "สุรา": ["alcohol"],
  "ยาเสพติด": ["substance use", "methamphetamine", "opioid", "addiction"],
  "สมุนไพร": ["herbal", "herb", "traditional medicine", "plant extract"],
  "แพทย์แผนไทย": ["thai traditional medicine", "thai massage", "herbal"],
  "นวดไทย": ["thai massage"],
  "กายภาพบำบัด": ["physical therapy", "physiotherapy", "rehabilitation"],
  "ฟื้นฟู": ["rehabilitation"],
  "ออกกำลังกาย": ["exercise", "physical activity", "training"],
  "โภชนาการ": ["nutrition", "diet", "dietary"],
  "อาหารเสริม": ["supplement", "supplementation"],
  "โปรไบโอติก": ["probiotic"],
  "สุขภาพดี": ["healthy volunteer", "healthy participant", "healthy adult", "healthy subject"],
};

const KEYS = Object.keys(THAI_TERMS).sort((a, b) => b.length - a.length);

const THAI_CHAR = /[฀-๿]/;

/**
 * Split a query into concepts. Each concept is a list of alternative English
 * terms (OR); a trial must match every concept (AND).
 */
export function expandQuery(q: string): string[][] {
  let rest = q.trim().toLowerCase();
  if (!rest) return [];
  const concepts: string[][] = [];
  for (const key of KEYS) {
    if (rest.includes(key)) {
      concepts.push(THAI_TERMS[key]);
      rest = rest.split(key).join(" ");
    }
  }
  // Remaining text: English tokens are used as phrases; unmatched Thai words are ignored
  // (they cannot appear in English records) but common filler words are dropped either way.
  const leftover = rest
    .split(/[\s,;/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !THAI_CHAR.test(t));
  if (leftover.length) concepts.push([leftover.join(" ")]);
  return concepts;
}

/** Popular topics shown as quick chips (Thai label → query). */
export const POPULAR_TOPICS: { th: string; q: string; icon: string }[] = [
  { th: "เบาหวาน", q: "เบาหวาน", icon: "🩸" },
  { th: "มะเร็ง", q: "มะเร็ง", icon: "🎗️" },
  { th: "หัวใจ", q: "หัวใจ", icon: "❤️" },
  { th: "ความดันสูง", q: "ความดัน", icon: "🩺" },
  { th: "เอชไอวี", q: "เอชไอวี", icon: "🧬" },
  { th: "วัคซีน", q: "วัคซีน", icon: "💉" },
  { th: "ไต", q: "ไต", icon: "🫘" },
  { th: "ซึมเศร้า", q: "ซึมเศร้า", icon: "🧠" },
  { th: "ตับ", q: "ตับ", icon: "🫀" },
  { th: "ไข้เลือดออก", q: "ไข้เลือดออก", icon: "🦟" },
  { th: "ตั้งครรภ์", q: "ตั้งครรภ์", icon: "🤰" },
  { th: "สมุนไพร", q: "สมุนไพร", icon: "🌿" },
];

/** Conditions offered as checkboxes in the screening questionnaire. */
export const SCREEN_CONDITIONS: string[] = [
  "เบาหวาน",
  "ความดันโลหิตสูง",
  "ไขมันในเลือดสูง",
  "หัวใจ",
  "หลอดเลือดสมอง",
  "ไต",
  "ตับ",
  "ไวรัสตับอักเสบบี",
  "เอชไอวี",
  "มะเร็งเต้านม",
  "มะเร็งปอด",
  "มะเร็งลำไส้",
  "มะเร็งตับ",
  "มะเร็งท่อน้ำดี",
  "มะเร็งปากมดลูก",
  "หอบหืด",
  "ภูมิแพ้",
  "ซึมเศร้า",
  "นอนไม่หลับ",
  "สมองเสื่อม",
  "ปวดหลัง",
  "ข้อเข่าเสื่อม",
  "กระดูกพรุน",
  "โรคอ้วน",
  "ธาลัสซีเมีย",
  "สะเก็ดเงิน",
  "ต้อกระจก",
  "ฟัน",
  "บุหรี่",
];
