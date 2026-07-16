import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
export {
  readJsonBodyWithLimit,
  RequestBodyError,
} from '@/lib/bounded-json';

export async function enforceUserRateLimit(
  userId: string,
  scope: string,
  limit: number,
  windowMs: number
): Promise<NextResponse | null> {
  const key = createHash('sha256').update(`${scope}:${userId}`).digest('hex');
  const ref = adminDb.collection('apiRateLimits').doc(key);
  const now = Date.now();

  const allowed = await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data() || {};
    const resetAt =
      typeof data.resetAt === 'number' && data.resetAt > now
        ? data.resetAt
        : now + windowMs;
    const count =
      typeof data.count === 'number' && data.resetAt > now
        ? data.count
        : 0;
    if (count >= limit) return false;

    transaction.set(ref, {
      userId,
      scope,
      count: count + 1,
      resetAt,
      updatedAt: now,
    });
    return true;
  });

  return allowed
    ? null
    : NextResponse.json(
        { error: 'Too many requests. Please wait and try again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(windowMs / 1000)) } }
      );
}
