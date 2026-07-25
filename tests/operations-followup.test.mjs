import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = path => readFile(new URL(path, import.meta.url), 'utf8');

test('Schedule includes finalized games from the scorekeeping ledger', async () => {
  const schedule = await readSource('../src/app/(dashboard)/calendar/page.tsx');

  assert.match(schedule, /collection\(db, 'teams', activeTeam\.id, 'games'\)/);
  assert.match(schedule, /recorded_game_/);
  assert.match(schedule, /isCompleted: true/);
  assert.match(schedule, /Final: \$\{activeTeam\?\.teamName/);
});

test('league enrollment moves from dashboard to Settings after joining', async () => {
  const dashboard = await readSource('../src/app/(dashboard)/dashboard/page.tsx');
  const settings = await readSource('../src/app/(dashboard)/settings/page.tsx');

  assert.match(dashboard, /!hasLeagueMembership && \(/);
  assert.match(settings, /hasLeagueMembership && \(/);
  assert.match(settings, /href="\/teams\/join"/);
  assert.match(settings, /League Membership/);
});

test('uniform inventory records jersey size and number per assignment', async () => {
  const equipment = await readSource('../src/app/(dashboard)/equipment/page.tsx');
  const provider = await readSource('../src/components/providers/team-provider.tsx');

  assert.match(equipment, /Jersey Size/);
  assert.match(equipment, /Jersey Number/);
  assert.match(provider, /details\?: \{ size\?: string; jerseyNumber\?: string \}/);
  assert.match(provider, /jerseyNumber\?: string/);
  assert.match(provider, /size: details\?\.size/);
  assert.match(provider, /jerseyNumber: details\?\.jerseyNumber/);
});

test('competition queries avoid fragile OR filters and isolate tab failures', async () => {
  const leagues = await readSource('../src/app/(dashboard)/leagues/leagues-page-content.tsx');
  const competition = await readSource('../src/app/(dashboard)/competition/page.tsx');

  assert.doesNotMatch(leagues, /\bor\(/);
  assert.match(leagues, /ownedLeaguesQuery/);
  assert.match(leagues, /memberLeaguesQuery/);
  assert.match(competition, /CompetitionSectionErrorBoundary/);
  assert.match(competition, /activeTab === 'leagues'/);
});

test('tournament logos accept and optimize common image formats with one close control', async () => {
  const tournaments = await readSource(
    '../src/app/(dashboard)/manage-tournaments/manage-tournaments-page-content.tsx'
  );
  const logoDialog = tournaments.slice(
    tournaments.indexOf('{/* Logo Edit Dialog */'),
    tournaments.indexOf('<TabsContent value="itinerary"')
  );

  assert.match(logoDialog, /accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(tournaments, /compressImage\(raw, 480, 480, 0\.78\)/);
  assert.equal((logoDialog.match(/<DialogClose/g) || []).length, 0);
});

test('fundraising uses connected Stripe and webhook idempotency instead of arbitrary URLs', async () => {
  const fundraising = await readSource('../src/app/(dashboard)/fundraising/page.tsx');
  const linkRoute = await readSource('../src/app/api/stripe/fundraising-link/route.ts');
  const webhook = await readSource('../src/app/api/stripe/connect/webhook/route.ts');

  assert.match(fundraising, /<StripeConnectSetup/);
  assert.match(fundraising, /fetch\('\/api\/stripe\/fundraising-link'/);
  assert.doesNotMatch(fundraising, /Stripe, PayPal, Venmo URL/);
  assert.match(linkRoute, /payment_intent_data/);
  assert.match(linkRoute, /externalLink: paymentLink\.url/);
  assert.match(webhook, /recordFundraisingDonation/);
  assert.match(webhook, /runTransaction/);
  assert.match(webhook, /stripe_\$\{paymentIntentId\}/);
  assert.match(webhook, /FieldValue\.increment\(amountCents \/ 100\)/);
});
