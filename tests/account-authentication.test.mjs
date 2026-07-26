import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = path => readFile(new URL(path, import.meta.url), 'utf8');

test('email-password signup requires verification before plan or tenant access', async () => {
  const signup = await source('../src/app/signup/page.tsx');
  const auth = await source('../src/lib/api-auth.ts');
  const rules = await source('../firestore.rules');

  assert.match(signup, /sendEmailVerification/);
  assert.match(signup, /router\.push\('\/verify-email'\)/);
  assert.match(auth, /auth\/email-not-verified/);
  assert.match(rules, /email_verified/);
  assert.match(rules, /hasActiveAccount/);
});

test('login preserves password whitespace and returns a non-enumerating error', async () => {
  const login = await source('../src/app/login/page.tsx');

  assert.match(login, /signInWithEmailAndPassword\(auth, email\.trim\(\)\.toLowerCase\(\), password\)/);
  assert.doesNotMatch(login, /signInWithEmailAndPassword\([^)]*password\.trim\(\)/);
  assert.match(login, /The email or password is incorrect, or this account is unavailable/);
});

test('email changes require verification before the stored profile email changes', async () => {
  const settings = await source('../src/app/(dashboard)/settings/page.tsx');

  assert.match(settings, /verifyBeforeUpdateEmail/);
  assert.match(settings, /saveProfileFields\(false\)/);
  assert.doesNotMatch(settings, /await updateEmail\(/);
});
