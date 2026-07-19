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

test('facility management remains owner-scoped for super admins', async () => {
  const source = await readSource('../src/app/(dashboard)/facilities/page.tsx');

  assert.match(
    source,
    /collection\(db, 'facilities'\), where\('clubId', '==', firebaseUser\.uid\)/
  );
  assert.doesNotMatch(
    source,
    /if \(isSuperAdmin\) \{\s*return query\(collection\(db, 'facilities'\)/
  );
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

test('demo recruiting profiles stay private except for the public scout fixture', async () => {
  const source = await readSource('../src/lib/db-seeder.ts');

  assert.match(source, /recruitingProfileEnabled: m\.name === 'Alex Rivera'/);
  assert.match(source, /if \(m\.name === 'Alex Rivera'\)[\s\S]{0,700}isPublic: true/);
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

test('Google sign-in keeps its provider and popup resolver in the same module boundary', async () => {
  const login = await readSource('../src/app/login/page.tsx');
  const nextConfig = await readSource('../next.config.ts');

  assert.match(login, /browserPopupRedirectResolver/);
  assert.match(login, /signInWithPopup\(auth, provider, browserPopupRedirectResolver\)/);
  assert.match(nextConfig, /script-src[^\n]*https:\/\/apis\.google\.com/);
  assert.match(nextConfig, /frame-src[^\n]*https:\/\/\*\.firebaseapp\.com/);
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

test('landing navigation sends authenticated users to the dashboard', async () => {
  const landing = await readSource('../src/app/page.tsx');

  assert.match(landing, /const accountHref = user \? '\/dashboard' : '\/login'/);
  assert.match(landing, /const accountLabel = user \? 'Dashboard' : 'Log In'/);
  assert.equal((landing.match(/href=\{accountHref\}/g) || []).length, 3);
});

test('newsletter subscription and sending are handled by protected server routes', async () => {
  const landing = await readSource('../src/app/page.tsx');
  const adminRoute = await readSource('../src/app/api/admin/newsletter/send/route.ts');
  const renderer = await readSource('../src/lib/newsletter-content.ts');

  assert.match(landing, /fetch\('\/api\/newsletter\/subscribe'/);
  assert.doesNotMatch(landing, /addDoc\(collection\(db, 'newsletter_signups'/);
  assert.match(adminRoute, /auth\.role !== 'superadmin'/);
  assert.match(adminRoute, /syncNewsletterSubscribersToResend/);
  assert.match(adminRoute, /broadcasts\.create/);
  assert.match(renderer, /RESEND_UNSUBSCRIBE_URL/);
});

test('production Firebase config cannot be replaced by preview credentials', async () => {
  const nextConfig = await readSource('../next.config.ts');
  assert.match(nextConfig, /process\.env\.VERCEL_ENV === 'production'/);
  assert.match(nextConfig, /\? ''/);
});

test('newsletter manager refreshes expired tokens and exposes rich text controls', async () => {
  const manager = await readSource('../src/components/admin/newsletter-manager.tsx');
  assert.match(manager, /response\.status === 401 \? requestWithToken\(true\)/);
  assert.match(manager, /aria-label="Rich text formatting"/);
  assert.match(manager, /Bold selected text/);
  assert.match(manager, /Italicize selected text/);
  assert.match(manager, /Format as bullet list/);
});

test('Resend webhook verifies raw signed payloads and processes each delivery once', async () => {
  const route = await readSource('../src/app/api/webhooks/resend/route.ts');
  assert.match(route, /const payload = await request\.text\(\)/);
  assert.match(route, /request\.headers\.get\('svix-id'\)/);
  assert.match(route, /request\.headers\.get\('svix-timestamp'\)/);
  assert.match(route, /request\.headers\.get\('svix-signature'\)/);
  assert.match(route, /webhooks\.verify/);
  assert.match(route, /RESEND_WEBHOOK_SECRET/);
  assert.match(route, /runTransaction/);
  assert.match(route, /status: 'processing'/);
  assert.match(route, /status: 'completed'/);
  assert.match(route, /updateSubscriberConsent/);
  const adminRoute = await readSource('../src/app/api/admin/newsletter/route.ts');
  const manager = await readSource('../src/components/admin/newsletter-manager.tsx');
  assert.match(adminRoute, /deliveredCount/);
  assert.match(adminRoute, /bouncedCount/);
  assert.match(manager, /campaign\.openedCount/);
  assert.match(manager, /campaign\.clickedCount/);
});

test('contact inquiries use a protected server delivery route', async () => {
  const landing = await readSource('../src/app/page.tsx');
  const route = await readSource('../src/app/api/contact/route.ts');

  assert.match(landing, /fetch\('\/api\/contact'/);
  assert.doesNotMatch(landing, /addDoc\(collection\(db, 'contact_inquiries'/);
  assert.match(route, /enforcePublicRateLimit/);
  assert.match(route, /CONTACT_RECIPIENT = 'team@thesquad\.pro'/);
  assert.match(route, /replyTo: email/);
  assert.match(route, /escapeHtml\(inquiry\)/);
  assert.match(route, /deliveryStatus: 'sent'/);
  assert.match(route, /deliveryStatus: 'failed'/);
});

test('superadmin account controls link to the admin page without exposing it to other roles', async () => {
  const shell = await readSource('../src/components/layout/Shell.tsx');

  assert.equal((shell.match(/\{isSuperAdmin && \(/g) || []).length >= 2, true);
  assert.equal((shell.match(/Go to Admin Page/g) || []).length, 2);
  assert.match(shell, /href="\/admin"/);
  assert.match(shell, /router\.push\('\/admin'\)/);
});

test('a product transition separates contact from the permanent newsletter signup', async () => {
  const landing = await readSource('../src/app/page.tsx');
  const contactIndex = landing.indexOf('<section id="contact"');
  const transitionIndex = landing.indexOf('<section id="built-for"');
  const newsletterIndex = landing.indexOf('<section id="newsletter"');
  const footerIndex = landing.indexOf('<footer');

  assert.ok(contactIndex >= 0);
  assert.ok(transitionIndex > contactIndex);
  assert.ok(newsletterIndex > transitionIndex);
  assert.ok(footerIndex > newsletterIndex);
  assert.match(landing, /One platform/);
  assert.match(landing, /Leagues & Tournaments/);
  assert.match(landing, /Sign up for our/);
  assert.match(landing, /Unsubscribe anytime/);
});
