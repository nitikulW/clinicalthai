import type { Metadata } from "next";
import { ScreenForm } from "@/components/ScreenForm";
import { PageTitle } from "@/components/TrialBits";
import { SCREEN_CONDITIONS } from "@/lib/thai-terms";

export const metadata: Metadata = { title: "คัดกรองเบื้องต้น" };

export default function ScreenPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageTitle
        title="คัดกรองตัวเองเบื้องต้น"
        sub="ตอบคำถามสั้นๆ แล้วระบบจะหางานวิจัยที่เปิดรับซึ่งอายุ เพศ พื้นที่ และโรคตรงกับคุณ"
      />
      <ScreenForm conditions={SCREEN_CONDITIONS} />
    </div>
  );
}
