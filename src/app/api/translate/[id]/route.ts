import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { AiRefusalError, aiEnabled, generatePlainThai, getCachedPlainThai } from "@/lib/ai";
import { getTrialDetail } from "@/lib/ctgov";

export const maxDuration = 120;

// Simple per-process rate limit so one client cannot burn through the API budget.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/translate/[id]">) {
  const { id } = await ctx.params;
  const trial = await getTrialDetail(id);
  if (!trial) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ enabled: aiEnabled(), data: await getCachedPlainThai(trial) });
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/translate/[id]">) {
  if (!aiEnabled()) {
    return Response.json({ error: "ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY" }, { status: 503 });
  }
  const { id } = await ctx.params;
  const trial = await getTrialDetail(id);
  if (!trial) return Response.json({ error: "not found" }, { status: 404 });

  const cached = await getCachedPlainThai(trial);
  if (cached) return Response.json({ data: cached });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: "เรียกใช้บ่อยเกินไป กรุณารอสักครู่" }, { status: 429 });

  try {
    return Response.json({ data: await generatePlainThai(trial) });
  } catch (e) {
    if (e instanceof AiRefusalError) {
      return Response.json({ error: "ระบบ AI ไม่สามารถสรุปงานวิจัยนี้ได้ กรุณาอ่านต้นฉบับ" }, { status: 422 });
    }
    if (e instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "ระบบ AI ใช้งานหนาแน่น กรุณาลองใหม่" }, { status: 429 });
    }
    if (e instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "API key ไม่ถูกต้อง" }, { status: 503 });
    }
    console.error("[translate]", e);
    return Response.json({ error: "แปลไม่สำเร็จ กรุณาลองใหม่" }, { status: 502 });
  }
}
