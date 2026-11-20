import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/Icon";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const thai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ClinicalThai — ค้นหางานวิจัยที่เปิดรับอาสาสมัครในไทย",
    template: "%s · ClinicalThai",
  },
  description:
    "ค้นหางานวิจัยทางคลินิกที่กำลังรับอาสาสมัครในประเทศไทย คัดกรองเบื้องต้น ดูแผนที่ศูนย์วิจัย และรับแจ้งเตือนผ่าน LINE ข้อมูลจาก ClinicalTrials.gov",
};

// Apply a saved theme before first paint to avoid a flash.
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${thai.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <Logo className="size-8" />
                <span className="text-base font-bold">
                  Clinical<span className="text-primary">Thai</span>
                </span>
              </div>
              <p className="mt-3 max-w-sm text-muted">
                รวมงานวิจัยทางคลินิกที่มีศูนย์วิจัยในประเทศไทย จากทะเบียน{" "}
                <a className="text-primary underline" href="https://clinicaltrials.gov" target="_blank" rel="noreferrer">
                  ClinicalTrials.gov
                </a>{" "}
                ผ่าน API สาธารณะ
              </p>
            </div>
            <div>
              <p className="font-semibold">สำหรับอาสาสมัคร</p>
              <ul className="mt-2 space-y-1.5 text-muted">
                <li><Link className="hover:text-primary" href="/trials">ค้นหางานวิจัย</Link></li>
                <li><Link className="hover:text-primary" href="/screen">คัดกรองเบื้องต้น</Link></li>
                <li><Link className="hover:text-primary" href="/map">แผนที่ศูนย์วิจัย</Link></li>
                <li><Link className="hover:text-primary" href="/learn">รู้ก่อนเข้าร่วม</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">สำหรับนักวิจัย</p>
              <ul className="mt-2 space-y-1.5 text-muted">
                <li><Link className="hover:text-primary" href="/research">ภาพรวมงานวิจัยในไทย</Link></li>
                <li><Link className="hover:text-primary" href="/research/explore">ผู้สนับสนุนและศูนย์วิจัย</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-line">
            <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted">
              ไม่ใช่คำแนะนำทางการแพทย์ และไม่ได้เป็นตัวแทนของทีมวิจัยใด ข้อมูลอาจไม่ครบหรือไม่เป็นปัจจุบันทุกรายการ
              การเข้าร่วมงานวิจัยต้องผ่านการคัดกรองและการให้ความยินยอม (Informed Consent) กับทีมวิจัยโดยตรง
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
