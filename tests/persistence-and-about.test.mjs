import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appPage = readFileSync(new URL('../src/app/page.tsx', import.meta.url), 'utf8');
const persistenceLib = readFileSync(new URL('../src/lib/sessionPersistence.ts', import.meta.url), 'utf8');
const aboutPage = readFileSync(new URL('../src/app/about/page.tsx', import.meta.url), 'utf8');

test('app page persists and restores summaries', () => {
  assert.match(appPage, /saveLatestEndSummary\(/);
  assert.match(appPage, /appendSummaryToHistory\(/);
  assert.match(appPage, /loadAppSnapshot\(/);
});

test('session persistence library exposes history and snapshot helpers', () => {
  assert.match(persistenceLib, /export function loadSummaryHistory/);
  assert.match(persistenceLib, /export function saveAppSnapshot/);
  assert.match(persistenceLib, /TRANCE_PREFS_KEY/);
});

test('about page includes evidence references and summary return path', () => {
  assert.match(aboutPage, /Evidence references:/);
  assert.match(aboutPage, /\?return=summary/);
});
