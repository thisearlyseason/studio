import assert from 'node:assert/strict';
import test from 'node:test';
import {
  renderNewsletterHtml,
  renderNewsletterText,
  safeNewsletterUrl,
} from '../src/lib/newsletter-content.ts';

const draft = {
  subject: 'Weekly update',
  previewText: 'News from The Squad',
  title: 'The Squad Weekly',
  blocks: [
    { id: 'one', type: 'heading', text: 'This **week**' },
    { id: 'two', type: 'paragraph', text: '- First item\n- Second *item*' },
    { id: 'three', type: 'image', url: 'https://example.com/team.jpg', alt: 'Team photo', caption: 'Game day' },
    { id: 'four', type: 'button', label: 'Open The Squad', url: 'https://thesquad.pro/dashboard' },
  ],
};

test('newsletter renderer supports formatting, images, buttons, and unsubscribe links', () => {
  const html = renderNewsletterHtml(draft);
  assert.match(html, /<strong>week<\/strong>/);
  assert.match(html, /<ul/);
  assert.match(html, /https:\/\/example\.com\/team\.jpg/);
  assert.match(html, /Open The Squad/);
  assert.match(html, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
  assert.match(renderNewsletterText(draft), /Unsubscribe: \{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
});

test('newsletter renderer escapes markup and rejects unsafe image protocols', () => {
  const html = renderNewsletterHtml({
    ...draft,
    title: '<script>alert(1)</script>',
    blocks: [
      { id: 'one', type: 'paragraph', text: '<img src=x onerror=alert(1)>' },
      { id: 'two', type: 'image', url: 'javascript:alert(1)', alt: 'unsafe' },
    ],
  });
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.doesNotMatch(html, /javascript:/);
  assert.equal(safeNewsletterUrl('http://example.com/image.jpg'), null);
  assert.equal(safeNewsletterUrl('https://example.com/image.jpg'), 'https://example.com/image.jpg');
});
