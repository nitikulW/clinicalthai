import { HELP_TEXT, handleCommand } from "@/lib/alerts";
import { getTrials } from "@/lib/ctgov";
import { lineEnabled, reply, text, verifySignature } from "@/lib/line";

interface LineEvent {
  type: string;
  replyToken?: string;
  source?: { type: string; userId?: string };
  message?: { type: string; text?: string };
}

export async function POST(req: Request) {
  if (!lineEnabled()) return Response.json({ error: "LINE not configured" }, { status: 503 });
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-line-signature"))) {
    return Response.json({ error: "bad signature" }, { status: 401 });
  }

  const { events = [] } = JSON.parse(raw) as { events?: LineEvent[] };
  const trials = await getTrials();

  await Promise.all(
    events.map(async (ev) => {
      if (!ev.replyToken) return;
      try {
        if (ev.type === "follow") {
          await reply(ev.replyToken, [text(HELP_TEXT)]);
        } else if (ev.type === "message" && ev.message?.type === "text" && ev.source?.userId) {
          const answer = await handleCommand(ev.source.userId, ev.message.text ?? "", trials);
          await reply(ev.replyToken, [text(answer)]);
        }
      } catch (e) {
        console.error("[line webhook]", e);
      }
    }),
  );
  return Response.json({ ok: true });
}
