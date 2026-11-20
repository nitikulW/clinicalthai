export const STATUS_TH: Record<string, string> = {
  RECRUITING: "กำลังรับอาสาสมัคร",
  NOT_YET_RECRUITING: "เร็วๆ นี้จะเปิดรับ",
  ENROLLING_BY_INVITATION: "รับเฉพาะผู้ได้รับเชิญ",
  ACTIVE_NOT_RECRUITING: "กำลังดำเนินการ (ปิดรับแล้ว)",
  COMPLETED: "เสร็จสิ้นแล้ว",
  SUSPENDED: "ระงับชั่วคราว",
  TERMINATED: "ยุติก่อนกำหนด",
  WITHDRAWN: "ถอนการศึกษา",
  UNKNOWN: "ไม่ทราบสถานะ",
  AVAILABLE: "เปิดให้ใช้ยาก่อนอนุมัติ",
  NO_LONGER_AVAILABLE: "ไม่เปิดให้ใช้แล้ว",
  TEMPORARILY_NOT_AVAILABLE: "ปิดชั่วคราว",
  APPROVED_FOR_MARKETING: "อนุมัติวางตลาดแล้ว",
  WITHHELD: "ระงับการเปิดเผย",
};

export const OPEN_STATUSES = ["RECRUITING", "NOT_YET_RECRUITING"];

export const PHASE_TH: Record<string, string> = {
  EARLY_PHASE1: "ระยะเริ่มต้น (Early 1)",
  PHASE1: "ระยะที่ 1",
  PHASE2: "ระยะที่ 2",
  PHASE3: "ระยะที่ 3",
  PHASE4: "ระยะที่ 4",
  NA: "ไม่แบ่งระยะ",
};

export const PHASE_SHORT: Record<string, string> = {
  EARLY_PHASE1: "Early 1",
  PHASE1: "1",
  PHASE2: "2",
  PHASE3: "3",
  PHASE4: "4",
  NA: "N/A",
};

export const PHASE_ORDER = ["EARLY_PHASE1", "PHASE1", "PHASE2", "PHASE3", "PHASE4", "NA"];

export const PHASE_EXPLAIN: Record<string, string> = {
  EARLY_PHASE1: "ทดสอบในคนจำนวนน้อยมาก เพื่อดูว่ายาทำงานในร่างกายอย่างไร",
  PHASE1: "ทดสอบความปลอดภัยและขนาดยาในคนกลุ่มเล็ก (มักเป็นคนสุขภาพดี)",
  PHASE2: "ทดสอบว่าได้ผลหรือไม่ และดูผลข้างเคียงในผู้ป่วยหลักร้อยคน",
  PHASE3: "เปรียบเทียบกับการรักษามาตรฐานในผู้ป่วยจำนวนมาก ก่อนขออนุมัติ",
  PHASE4: "ติดตามผลหลังยาได้รับอนุมัติและวางขายแล้ว",
  NA: "การศึกษาที่ไม่ใช่การทดลองยา เช่น อุปกรณ์ พฤติกรรม หรือการสังเกต",
};

export const SPONSOR_CLASS_TH: Record<string, string> = {
  INDUSTRY: "ภาคเอกชน/บริษัทยา",
  OTHER: "มหาวิทยาลัย/โรงพยาบาล/อื่นๆ",
  OTHER_GOV: "หน่วยงานรัฐ",
  NIH: "NIH (สหรัฐฯ)",
  FED: "รัฐบาลกลางสหรัฐฯ",
  NETWORK: "เครือข่ายวิจัย",
  INDIV: "บุคคล",
  AMBIG: "ไม่ระบุชัด",
  UNKNOWN: "ไม่ทราบ",
};

export const STUDY_TYPE_TH: Record<string, string> = {
  INTERVENTIONAL: "การทดลอง (มีการให้ยา/วิธีรักษา)",
  OBSERVATIONAL: "การศึกษาเชิงสังเกต",
  EXPANDED_ACCESS: "การเข้าถึงยาก่อนอนุมัติ",
};

export const INTERVENTION_TH: Record<string, string> = {
  DRUG: "ยา",
  BIOLOGICAL: "ชีววัตถุ/วัคซีน",
  DEVICE: "อุปกรณ์การแพทย์",
  PROCEDURE: "หัตถการ/การผ่าตัด",
  BEHAVIORAL: "พฤติกรรม",
  DIETARY_SUPPLEMENT: "อาหารเสริม",
  DIAGNOSTIC_TEST: "การตรวจวินิจฉัย",
  RADIATION: "รังสีรักษา",
  GENETIC: "พันธุกรรม",
  COMBINATION_PRODUCT: "ผลิตภัณฑ์ผสม",
  OTHER: "อื่นๆ",
};

export const SEX_TH: Record<string, string> = {
  ALL: "ทุกเพศ",
  MALE: "ชายเท่านั้น",
  FEMALE: "หญิงเท่านั้น",
};

export function label(map: Record<string, string>, key: string | undefined | null): string {
  if (!key) return "-";
  return map[key] ?? key;
}
