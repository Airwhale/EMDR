import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Since we can't import TS directly in Node without a loader,
// we test the persistence logic by inlining the core functions
// and verifying their behavior with a mock localStorage.

const storage = new Map();
const localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};

// Inline the core persistence logic for testing
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function loadJSON(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

test.beforeEach(() => { storage.clear(); });

test('JSON roundtrip: save and load', () => {
  const data = { mode: 'emdr', sudStart: 5, sudEnd: 2 };
  saveJSON('test.key', data);
  assert.deepEqual(loadJSON('test.key'), data);
});

test('load returns null for missing key', () => {
  assert.equal(loadJSON('nonexistent'), null);
});

test('load returns null for corrupted JSON', () => {
  localStorage.setItem('bad', '{not json');
  assert.equal(loadJSON('bad'), null);
});

test('history append respects max cap', () => {
  const KEY = 'test.history';
  function appendToHistory(item, max = 5) {
    const existing = loadJSON(KEY) ?? [];
    const next = [item, ...existing].slice(0, max);
    saveJSON(KEY, next);
    return next;
  }
  for (let i = 0; i < 12; i++) {
    appendToHistory({ id: i });
  }
  const history = loadJSON(KEY);
  assert.equal(history.length, 5);
  assert.equal(history[0].id, 11); // most recent first
});

test('boolean flag persistence (safety acknowledged)', () => {
  const KEY = 'test.safety';
  assert.equal(localStorage.getItem(KEY), null);
  localStorage.setItem(KEY, 'true');
  assert.equal(localStorage.getItem(KEY), 'true');
});

// Verify About page has no fake evidence labels
test('about page does not contain unsourced evidence callouts', () => {
  const about = readFileSync(new URL('../src/app/about/page.tsx', import.meta.url), 'utf8');
  assert.ok(!about.includes('evidence:'), 'About page should not have evidence: fields without real links');
  assert.ok(!about.includes('Evidence references:'), 'About page should not show "Evidence references:" label');
});

// Verify safety gate exists
test('safety gate component exists', () => {
  const gate = readFileSync(new URL('../src/components/shared/SafetyGate.tsx', import.meta.url), 'utf8');
  assert.ok(gate.includes('988'), 'Safety gate should include crisis hotline number');
  assert.ok(gate.includes('onContinue'), 'Safety gate should have a continue handler');
});
