import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SNAPSHOT_MAX_AGE_MS,
  clampHistory,
  isFreshIsoDate,
  safeParseJSON,
} from '../src/lib/sessionPersistenceCore.mjs';

const aboutPage = readFileSync(new URL('../src/app/about/page.tsx', import.meta.url), 'utf8');
const summaryPage = readFileSync(new URL('../src/components/shared/SessionEndSummary.tsx', import.meta.url), 'utf8');

test('safeParseJSON handles valid and invalid payloads', () => {
  assert.deepEqual(safeParseJSON('{"ok":true}'), { ok: true });
  assert.equal(safeParseJSON('{bad-json'), null);
  assert.equal(safeParseJSON(''), null);
});

test('isFreshIsoDate enforces recency window', () => {
  const fresh = new Date(Date.now() - 1_000).toISOString();
  const stale = new Date(Date.now() - (SNAPSHOT_MAX_AGE_MS + 1_000)).toISOString();
  assert.equal(isFreshIsoDate(fresh, SNAPSHOT_MAX_AGE_MS), true);
  assert.equal(isFreshIsoDate(stale, SNAPSHOT_MAX_AGE_MS), false);
  assert.equal(isFreshIsoDate('not-a-date', SNAPSHOT_MAX_AGE_MS), false);
});

test('clampHistory keeps max items and rejects non-arrays', () => {
  assert.deepEqual(clampHistory([1, 2, 3], 2), [1, 2]);
  assert.deepEqual(clampHistory('not-array', 2), []);
});

test('about page and summary link share return-to-summary flow', () => {
  assert.match(summaryPage, /\/about\?return=summary/);
  assert.match(aboutPage, /setBackHref\("\/\?return=summary"\)/);
  assert.match(aboutPage, /href=\{backHref\}/);
});
