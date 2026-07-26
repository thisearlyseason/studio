import assert from 'node:assert/strict';
import test from 'node:test';
import {
  accountCreationLimit,
  normalizeCreationText,
} from '../src/lib/account-creation-policy.ts';

test('only active or trialing paid subscriptions receive configured capacity', () => {
  assert.equal(accountCreationLimit(undefined), 1);
  assert.equal(accountCreationLimit({ plan_type: 'free', team_limit: 99 }), 1);
  assert.equal(
    accountCreationLimit({
      plan_type: 'elite',
      subscription_status: 'active',
      team_limit: 8,
    }),
    8
  );
  assert.equal(
    accountCreationLimit({
      plan_type: 'school',
      subscription_status: 'trialing',
      team_limit: 15,
      extra_teams: 2,
    }),
    17
  );
  for (const status of ['past_due', 'unpaid', 'canceled', 'incomplete', 'paused']) {
    assert.equal(
      accountCreationLimit({
        plan_type: 'elite',
        subscription_status: status,
        team_limit: 8,
      }),
      1
    );
  }
});

test('creation capacity and text are bounded', () => {
  assert.equal(
    accountCreationLimit({
      plan_type: 'league',
      subscription_status: 'active',
      team_limit: 1000,
      extra_teams: 1000,
    }),
    100
  );
  assert.equal(
    normalizeCreationText('  Élite O’Reilly  ', { field: 'name', max: 120 }),
    'Élite O’Reilly'
  );
  assert.throws(
    () => normalizeCreationText('x'.repeat(121), { field: 'name', max: 120 }),
    /NAME_INVALID/
  );
});
