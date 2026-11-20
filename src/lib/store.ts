import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Tiny JSON-file store for LINE alert subscriptions and the set of trial IDs
 * already announced. Fine for a single server; swap for Postgres/Redis
 * (same interface) when deploying to serverless or multiple instances.
 */

export interface Subscription {
  id: string;
  lineUserId: string;
  /** Free-text topic (Thai or English), expanded with expandQuery */
  topic: string;
  /** Province key (English) or undefined for anywhere */
  province?: string;
  createdAt: string;
}

interface StoreShape {
  subscriptions: Subscription[];
  /** Trial IDs that were open at the last notify run */
  seenOpen: string[];
  lastRunAt?: string;
}

const FILE = path.join(
  process.env.DATA_DIR ?? (process.env.VERCEL ? path.join(os.tmpdir(), "clinicalthai-data") : path.join(process.cwd(), ".data")),
  "store.json",
);
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<StoreShape> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as StoreShape;
  } catch {
    return { subscriptions: [], seenOpen: [] };
  }
}

async function save(s: StoreShape) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(s, null, 2));
  await fs.rename(tmp, FILE);
}

/** Serialize read-modify-write cycles within this process. */
export function withStore<T>(fn: (s: StoreShape) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const s = await load();
    const result = await fn(s);
    await save(s);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function readStore(): Promise<StoreShape> {
  await queue;
  return load();
}

export const MAX_SUBS_PER_USER = 10;
