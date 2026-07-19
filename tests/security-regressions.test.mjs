import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = path => readFile(new URL(path, import.meta.url), 'utf8');

test('connected-account webhooks bind payment metadata to the configured team payout account', async () => {
  const webhook = await readSource('../src/app/api/stripe/connect/webhook/route.ts');
  const resolver = await readSource('../src/lib/server-stripe-connect.ts');
  assert.match(webhook, /connectAccountOwnsTeam/);
  assert.match(webhook, /Connected account does not own the referenced team/);
  assert.match(resolver, /team\.ownerUserId/);
  assert.doesNotMatch(resolver, /requesting user's personal connected account/);
});

test('team payment destinations and Stripe object creation are idempotent', async () => {
  const onboard = await readSource('../src/app/api/stripe/connect/onboard/route.ts');
  const paymentItems = await readSource('../src/app/api/stripe/payment-items/route.ts');
  const fundraising = await readSource('../src/app/api/stripe/fundraising-link/route.ts');
  assert.match(onboard, /stripeConnectAccountId/);
  assert.match(onboard, /idempotencyKey: `connect-account:/);
  assert.match(paymentItems, /operationId/);
  assert.match(paymentItems, /idempotencyKey: `payment-item:/);
  assert.match(fundraising, /operationId/);
  assert.match(fundraising, /idempotencyKey: `fundraising:/);
});

test('subscription mutations are bounded, rate limited, locked, and deterministic', async () => {
  const cancel = await readSource('../src/app/api/subscription/cancel/route.ts');
  const sync = await readSource('../src/app/api/subscription/sync/route.ts');
  for (const source of [cancel, sync]) {
    assert.match(source, /readJsonBodyWithLimit/);
    assert.match(source, /enforceUserRateLimit/);
    assert.match(source, /claimSubscriptionMutation/);
    assert.match(source, /releaseSubscriptionMutation/);
  }
  assert.match(sync, /chooseAuthoritativeSubscriptionId/);
});

test('stale Stripe webhook processing leases can be reclaimed', async () => {
  const webhook = await readSource('../src/app/api/webhook/route.ts');
  assert.match(webhook, /WEBHOOK_PROCESSING_LEASE_MS/);
  assert.match(webhook, /processingStartedAt/);
});

test('live deletion immediately revokes access and purges on a short schedule', async () => {
  const route = await readSource('../src/app/api/account/deletion-request/route.ts');
  const functions = await readSource('../functions/src/index.ts');
  assert.match(route, /revokeRefreshTokens\(auth\.uid\)/);
  assert.match(route, /updateUser\(auth\.uid, \{ disabled: true \}\)/);
  assert.match(functions, /purgeExpiredDeletionRequests = onSchedule\('every 15 minutes'/);
});

test('removed members cannot use payment or poll member access checks', async () => {
  const items = await readSource('../src/app/api/stripe/payment-items/route.ts');
  const vote = await readSource('../src/app/api/teams/chat/vote/route.ts');
  for (const source of [items, vote]) {
    assert.match(source, /status !== 'removed'/);
    assert.match(source, /isDeleted !== true/);
  }
});
