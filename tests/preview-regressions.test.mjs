import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = path => readFile(new URL(path, import.meta.url), 'utf8');

test('facility rename scans owner-scoped schedules without collection-group indexes', async () => {
  const source = await readSource('../src/app/api/facilities/update/route.ts');
  assert.match(source, /where\('ownerUserId', '==', facilityOwnerId\)/);
  assert.match(source, /teamDoc\.ref\.collection\('events'\)\.get\(\)/);
  assert.match(source, /auth\.role === 'superadmin'/);
  assert.doesNotMatch(source, /requesterSnap\.data\(\)\?\.role/);
  assert.doesNotMatch(source, /collectionGroup\('events'\)/);
});

test('squad recruitment links never redirect into league registration', async () => {
  const roster = await readSource('../src/app/(dashboard)/roster/page.tsx');
  const team = await readSource('../src/app/(dashboard)/team/page.tsx');
  for (const source of [roster, team]) {
    assert.match(source, /\/teams\/join\?code=/);
    assert.doesNotMatch(source, /registrationProtocolId[\s\S]{0,180}register\/league/);
  }
});

test('recruitment page resolves the linked squad and requires confirmation', async () => {
  const page = await readSource('../src/app/(dashboard)/teams/join/page.tsx');
  const route = await readSource('../src/app/api/teams/join/route.ts');
  assert.match(route, /export async function GET/);
  assert.match(route, /enforceUserRateLimit/);
  assert.match(route, /readJsonBodyWithLimit/);
  assert.match(page, /Join \{invitePreview\?\.teamName/);
  assert.match(page, /'Join Squad'/);
  assert.match(page, /<AlertDialog/);
});

test('demo batches stay below the rules-engine access-call ceiling', async () => {
  const source = await readSource('../src/lib/db-seeder.ts');
  assert.match(source, /CHUNK_SIZE = 5/);
  assert.match(source, /transientCodes/);
});

test('local Firebase client and Admin SDK honor the isolated preview project', async () => {
  const nextConfig = await readSource('../next.config.ts');
  const clientConfig = await readSource('../src/firebase/config.ts');
  const adminConfig = await readSource('../src/lib/firebase-admin.ts');

  assert.match(nextConfig, /process\.env\.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG/);
  assert.match(clientConfig, /Local Firebase configuration is missing/);
  assert.match(adminConfig, /process\.env\.GOOGLE_CLOUD_PROJECT \|\| process\.env\.GCLOUD_PROJECT/);
  assert.match(adminConfig, /admin\.initializeApp\(projectId \? \{ projectId \} : undefined\)/);
});

test('school hub onboarding waits for profile hydration and permits the guarded hub route', async () => {
  const layout = await readSource('../src/app/(dashboard)/layout.tsx');

  assert.match(layout, /!user \|\| !userProfile \|\| isDemoInitializing/);
  assert.match(layout, /pathname === '\/club'/);
});

test('team member hydration does not bulk-read private user profiles', async () => {
  const provider = await readSource('../src/components/providers/team-provider.tsx');

  assert.doesNotMatch(provider, /query\(collection\(db, 'users'\), where\(documentId\(\), 'in'/);
  assert.doesNotMatch(provider, /Hydration partial failure/);
});

test('demo organization hubs do not call Stripe Connect', async () => {
  const settings = await readSource('../src/components/finance/HubStripeSettings.tsx');
  const club = await readSource('../src/app/(dashboard)/club/page.tsx');

  assert.match(settings, /if \(isDemo\)/);
  assert.match(settings, /Online Payments Disabled in Demo/);
  assert.match(club, /isDemo=\{user\.isDemo === true\}/);
});

test('demo role selector has an accessible description', async () => {
  const landing = await readSource('../src/app/page.tsx');

  assert.match(landing, /Choose a demo role to open an isolated sample workspace/);
});
