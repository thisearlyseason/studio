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
