import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('public volunteer links use the validated server route and collect contact relationship', () => {
  const page = read('../src/app/public/volunteer/[teamId]/[oppId]/page.tsx');
  const route = read('../src/app/api/public/volunteer/route.ts');

  assert.match(page, /\/api\/public\/volunteer/);
  assert.doesNotMatch(page, /useDoc|publicSignUpForVolunteer/);
  for (const field of ['name', 'email', 'phone', 'relationship']) {
    assert.match(route, new RegExp(`\\b${field}\\b`));
  }
  assert.match(route, /runTransaction/);
  assert.match(route, /Idempotency|idempotency-key/i);
});

test('score broadcasts and tactical chat creation use authenticated server routes', () => {
  const gamesPage = read('../src/app/(dashboard)/games/page.tsx');
  const gamesRoute = read('../src/app/api/teams/games/route.ts');
  const chatProvider = read('../src/components/providers/team-provider.tsx');
  const chatRoute = read('../src/app/api/teams/chat/route.ts');

  assert.match(gamesPage, /fetch\('\/api\/teams\/games'/);
  assert.match(gamesRoute, /verifyFirebaseToken/);
  assert.match(gamesRoute, /getTeamAuthority/);
  assert.match(chatProvider, /fetch\('\/api\/teams\/chat'/);
  assert.match(chatRoute, /parentChatEnabled/);
  assert.match(chatRoute, /One or more recipients are outside your approved chat scope/);
});

test('coach parent-access toggles are prominent in the tactical chat hub', () => {
  const chatPage = read('../src/app/(dashboard)/chats/page.tsx');

  assert.match(chatPage, /Coach & Organizer Controls/);
  assert.match(chatPage, /Parent Communication Access/);
  assert.match(chatPage, /Parent-to-Parent Chat/);
  assert.match(chatPage, /Parent Live Feed/);
  assert.match(chatPage, /Parent Feed Comments/);
  assert.match(chatPage, /Currently On/);
  assert.match(chatPage, /Currently Off/);
});

test('institution switcher headers do not repeat the active sub-squad', () => {
  const shell = read('../src/components/layout/Shell.tsx');

  assert.match(shell, /Keep the collapsed header organization-focused/);
  assert.match(shell, /Elite Team and Elite League owners see only/);
  assert.doesNotMatch(shell, /↳ \{activeTeam\?\.name \|\| 'Squad'\}/);
});
