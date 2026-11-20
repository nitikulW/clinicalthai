import crypto from "node:crypto";

/**
 * Minimal LINE Messaging API client.
 * https://developers.line.biz/en/reference/messaging-api/
 */

const API = "https://api.line.me/v2/bot/message";

export function lineEnabled() {
  return Boolean(process.env.LINE_CHANNEL_SECRET && process.env.LINE_CHANNEL_ACCESS_TOKEN);
}

export function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest();
  const given = Buffer.from(signature, "base64");
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export type LineMessage = { type: "text"; text: string } | Record<string, unknown>;

async function call(endpoint: string, payload: unknown) {
  const res = await fetch(`${API}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`LINE ${endpoint} ${res.status}: ${await res.text()}`);
  }
}

export function reply(replyToken: string, messages: LineMessage[]) {
  return call("reply", { replyToken, messages: messages.slice(0, 5) });
}

export function push(to: string, messages: LineMessage[]) {
  return call("push", { to, messages: messages.slice(0, 5) });
}

export const text = (t: string): LineMessage => ({ type: "text", text: t.slice(0, 5000) });

export function siteUrl(p = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${p}`;
}
