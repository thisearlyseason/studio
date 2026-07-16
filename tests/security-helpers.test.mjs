import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertSafeExternalUrl,
  isPrivateNetworkAddress,
} from '../src/lib/safe-external-url.ts';

test('private and special-use IPv4 ranges are rejected', () => {
  for (const address of [
    '0.0.0.0',
    '10.1.2.3',
    '100.64.0.1',
    '127.0.0.1',
    '169.254.169.254',
    '172.16.0.1',
    '192.168.1.1',
    '198.18.0.1',
    '224.0.0.1',
  ]) {
    assert.equal(isPrivateNetworkAddress(address), true, address);
  }
  assert.equal(isPrivateNetworkAddress('8.8.8.8'), false);
});

test('private IPv6 ranges are rejected', () => {
  for (const address of ['::', '::1', 'fc00::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1']) {
    assert.equal(isPrivateNetworkAddress(address), true, address);
  }
  assert.equal(isPrivateNetworkAddress('2606:4700:4700::1111'), false);
});

test('unsafe RSS URL forms are rejected before a request is made', async () => {
  await assert.rejects(() => assertSafeExternalUrl('http://example.com/feed'));
  await assert.rejects(() => assertSafeExternalUrl('https://localhost/feed'));
  await assert.rejects(() => assertSafeExternalUrl('https://127.0.0.1/feed'));
  await assert.rejects(() => assertSafeExternalUrl('https://[::1]/feed'));
  await assert.rejects(() => assertSafeExternalUrl('https://user:pass@example.com/feed'));
  await assert.rejects(() => assertSafeExternalUrl('https://example.com:8443/feed'));
});
