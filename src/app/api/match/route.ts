import { getTrials } from "@/lib/ctgov";
import { PROVINCES } from "@/lib/provinces";
import { type ScreenAnswers, screenMatch } from "@/lib/search";

export async function POST(req: Request) {
  let body: Partial<ScreenAnswers>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  const age = Number(body.age);
  if (!Number.isFinite(age) || age < 0 || age > 120) {
    return Response.json({ error: "กรุณาระบุอายุให้ถูกต้อง" }, { status: 400 });
  }
  const answers: ScreenAnswers = {
    age,
    sex: body.sex === "MALE" ? "MALE" : "FEMALE",
    province: PROVINCES.some((p) => p.en === body.province) ? body.province : undefined,
    travel: body.travel === "province" || body.travel === "region" ? body.travel : "anywhere",
    conditions: Array.isArray(body.conditions) ? body.conditions.map(String).slice(0, 20) : [],
    otherCondition: typeof body.otherCondition === "string" ? body.otherCondition.slice(0, 100) : undefined,
    healthyWilling: Boolean(body.healthyWilling),
  };

  const results = screenMatch(await getTrials(), answers).slice(0, 50);
  return Response.json({
    count: results.length,
    results: results.map((r) => ({
      id: r.trial.id,
      title: r.trial.title,
      status: r.trial.status,
      phases: r.trial.phases,
      conditions: r.trial.conditions.slice(0, 4),
      reasons: r.reasons,
      nearSites: r.nearSites,
      score: r.score,
    })),
  });
}
