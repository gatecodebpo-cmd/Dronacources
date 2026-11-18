import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { _mongoose?: Cache };
// Cached on globalThis so hot reload and serverless warm starts reuse one connection.
const cache: Cache = g._mongoose ?? (g._mongoose = { conn: null, promise: null });

/**
 * Some Windows setups hand Node a dead resolver (127.0.0.1), which breaks mongodb+srv lookups
 * with querySrv ECONNREFUSED. Retry once with public resolvers in that case.
 */
export async function connectWithDnsFallback(uri: string, opts: mongoose.ConnectOptions = {}) {
  try {
    return await mongoose.connect(uri, opts);
  } catch (e: any) {
    if (!/querySrv|ENOTFOUND|ECONNREFUSED/.test(String(e?.message)) || !uri.startsWith("mongodb+srv")) throw e;
    const dns = await import("node:dns");
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    return mongoose.connect(uri, opts);
  }
}

export async function dbConnect() {
  if (cache.conn) return cache.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local.");
  cache.promise ??= connectWithDnsFallback(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10000, maxPoolSize: 10 });
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }
  return cache.conn;
}

/** Turn lean Mongoose docs (ObjectIds, Dates) into plain JSON-safe objects for client components. */
export function plain<T>(doc: T): any {
  return JSON.parse(JSON.stringify(doc));
}
