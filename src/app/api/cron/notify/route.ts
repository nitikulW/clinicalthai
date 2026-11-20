import { computeNotifications, formatAlert } from "@/lib/alerts";
import { getDataset } from "@/lib/ctgov";
import { lineEnabled, push, text } from "@/lib/line";

export const maxDuration = 300;

/**
 * Refreshes the ClinicalTrials.gov snapshot and pushes LINE alerts for
 * newly opened trials. Call from a scheduler (Vercel Cron, GitHub Actions,
 * crontab) with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const data = await getDataset({ force: true });
  const { firstRun, freshCount, perUser } = await computeNotifications(data.trials);

  let sent = 0;
  const errors: string[] = [];
  if (lineEnabled()) {
    for (const [userId, groups] of perUser) {
      try {
        await push(userId, [text(formatAlert(groups))]);
        sent++;
      } catch (e) {
        errors.push(String(e));
      }
    }
  }

  return Response.json({
    fetchedAt: data.fetchedAt,
    trials: data.trials.length,
    firstRun,
    newlyOpen: freshCount,
    usersMatched: perUser.size,
    sent,
    lineEnabled: lineEnabled(),
    errors: errors.slice(0, 5),
  });
}
