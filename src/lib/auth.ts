import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";

export const SESSION_COOKIE = "tl_session";
const SESSION_DAYS = 30;

export type Workspace = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: Date;
};

export function generateApiKey(): string {
  return `tl_${randomBytes(24).toString("base64url")}`;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt, key] = hash.split(":");
    const derivedKey = Buffer.from(scryptSync(password, salt, 64));
    const keyBuffer = Buffer.from(key, "hex");
    return derivedKey.length === keyBuffer.length && timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

export async function createUser(email: string, password: string) {
  const db = getDb();
  const normalized = email.toLowerCase().trim();
  const [user] = await db<{ id: string }[]>`
    insert into users (email, password_hash)
    values (${normalized}, ${hashPassword(password)})
    returning id
  `;
  return user;
}

export async function findUserByEmail(email: string) {
  const db = getDb();
  const normalized = email.toLowerCase().trim();
  const [user] = await db<{ id: string; email: string; password_hash: string }[]>`
    select id, email, password_hash
    from users
    where lower(email) = ${normalized}
    limit 1
  `;
  return user ?? null;
}

export async function createWorkspace(name: string, userId?: string | null) {
  const db = getDb();
  const apiKey = generateApiKey();
  const prefix = apiKey.slice(0, 11);

  const [workspace] = await db<Workspace[]>`
    insert into workspaces (name, key_hash, key_prefix, user_id)
    values (${name}, ${hashToken(apiKey)}, ${prefix}, ${userId ?? null})
    returning id, name, key_prefix, created_at
  `;

  return { workspace, apiKey };
}

export async function rotateApiKey(workspaceId: string) {
  const db = getDb();
  const apiKey = generateApiKey();
  const prefix = apiKey.slice(0, 11);

  await db`
    update workspaces
    set key_hash = ${hashToken(apiKey)}, key_prefix = ${prefix}
    where id = ${workspaceId}
  `;

  return { apiKey, prefix };
}

export async function getWorkspaceByKey(apiKey: string): Promise<Workspace | null> {
  if (!apiKey.startsWith("tl_")) return null;
  const db = getDb();
  const [workspace] = await db<Workspace[]>`
    select id, name, key_prefix, created_at
    from workspaces
    where key_hash = ${hashToken(apiKey)}
    limit 1
  `;
  return workspace ?? null;
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  return request.headers.get("x-api-key")?.trim() || null;
}

export async function getWorkspaceFromRequest(request: Request): Promise<Workspace | null> {
  const token = bearerToken(request);
  if (!token) return null;
  return getWorkspaceByKey(token);
}

export async function createSession(workspaceId?: string | null, userId?: string | null) {
  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  if (workspaceId && userId) {
    await db`
      insert into sessions (token_hash, workspace_id, user_id, expires_at)
      values (${hashToken(token)}, ${workspaceId}, ${userId}, ${expiresAt})
    `;
  } else if (workspaceId) {
    await db`
      insert into sessions (token_hash, workspace_id, expires_at)
      values (${hashToken(token)}, ${workspaceId}, ${expiresAt})
    `;
  } else if (userId) {
    await db`
      insert into sessions (token_hash, user_id, expires_at)
      values (${hashToken(token)}, ${userId}, ${expiresAt})
    `;
  } else {
    throw new Error("session requires workspace or user");
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = getDb();
    await db`delete from sessions where token_hash = ${hashToken(token)}`;
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentWorkspace(): Promise<Workspace | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const [workspace] = await db<Workspace[]>`
    select w.id, w.name, w.key_prefix, w.created_at
    from sessions s
    join workspaces w on w.id = s.workspace_id
    where s.token_hash = ${hashToken(token)}
      and s.expires_at > now()
    limit 1
  `;

  if (workspace) return workspace;

  const [userWorkspace] = await db<Workspace[]>`
    select w.id, w.name, w.key_prefix, w.created_at
    from sessions s
    join workspaces w on w.user_id = s.user_id
    where s.token_hash = ${hashToken(token)}
      and s.expires_at > now()
    order by w.created_at asc
    limit 1
  `;

  return userWorkspace ?? null;
}

export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const db = getDb();
  const workspaces = await db<Workspace[]>`
    select id, name, key_prefix, created_at
    from workspaces
    where user_id = ${userId}
    order by created_at asc
  `;
  return workspaces;
}
