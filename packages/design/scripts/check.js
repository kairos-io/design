#!/usr/bin/env node
// Fails when the decks and the package differ.
//  1. Every hex color in a deck exists in tokens.json.
//  2. Every var(--name) in a deck is a token name.
//  3. Every '--name': '#hex' pair in a deck theme map matches the base theme or a variant listed for that deck in DECK_VARIANTS.
//     The base value is always allowed for every deck; that is intended, most decks use it.
//  4. tokens.css and tailwind.css equal what scripts/build.js writes now.
'use strict';
const fs = require('fs');
const path = require('path');
const { generate, loadTokens, root } = require('./build');

const repo = path.join(root, '..', '..');
const t = loadTokens();
const errors = [];
const norm = h => {
  h = h.toUpperCase();
  return h.length === 4 ? '#' + [...h.slice(1)].map(c => c + c).join('') : h;
};

// Known hex values and variable names.
const known = new Set();
const addHex = h => known.add(norm(h));
Object.values(t.color.brand).forEach(addHex);
Object.values(t.color.status).forEach(addHex);
Object.keys(t.untokenised.colors).forEach(addHex);
const names = new Set(Object.keys(t.themes.light));
for (const mode of ['light', 'dark']) {
  Object.values(t.themes[mode]).forEach(addHex);
  for (const v of Object.values(t.variants)) Object.values(v[mode]).forEach(addHex);
}
for (const v of Object.values(t.variants)) for (const mode of ['light', 'dark']) Object.keys(v[mode]).forEach(n => names.add(n));

// Which variants each deck is allowed to use, read from the decks' own theme maps.
// A deck is checked against the base theme plus the variants listed here, and no others.
// A deck with a theme map that is not listed fails, so a new deck must be added on purpose.
const DECK_VARIANTS = {
  'Kairos - Foundations.dc.html': ['foundations'],
  'Kairos - Naming.dc.html': [],
  'Kairos - Presentations.dc.html': [],
  'Kairos Console - Build Artifact.dc.html': ['console'],
  'Kairos Console - Node Detail.dc.html': ['console'],
  'Kairos Console - Nodes.dc.html': ['console'],
  'Kairos Docs - Product Page.dc.html': [],
  'Kairos Installer.dc.html': ['installer'],
  'hadron-linux.io Homepage.dc.html': ['site', 'hadron'],
  'kairos.io Homepage.dc.html': ['site']
};

function allowed(mode, name, deck) {
  const s = new Set([t.themes[mode][name]]);
  for (const vn of DECK_VARIANTS[deck] || []) {
    const v = t.variants[vn];
    if (!v) errors.push(`check.js lists variant ${vn} for ${deck}, which tokens.json does not have`);
    else if (v[mode][name]) s.add(v[mode][name]);
  }
  return [...s].filter(Boolean).map(norm);
}

const decks = fs.readdirSync(repo).filter(f => f.endsWith('.dc.html')).sort();
for (const k of Object.keys(DECK_VARIANTS)) if (!decks.includes(k)) errors.push(`DECK_VARIANTS in check.js lists ${k}, but there is no such deck; renamed or deleted?`);
const reportedUnlisted = new Set();
const usedHex = new Set();
for (const deck of decks) {
  const src = fs.readFileSync(path.join(repo, deck), 'utf8');
  for (const m of src.matchAll(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
    const h = norm(m[0]);
    usedHex.add(h);
    if (!known.has(h)) errors.push(`${deck}: color ${m[0]} is not in tokens.json`);
  }
  for (const m of new Set([...src.matchAll(/var\(\s*--([A-Za-z0-9_-]+)/g)].map(x => x[1]))) {
    if (!names.has(m)) errors.push(`${deck}: var(--${m}) is not a token name`);
  }
  for (const map of src.matchAll(/\{[^{}]*'--bg'[^{}]*\}/g)) {
    const pairs = [...map[0].matchAll(/'--([A-Za-z0-9-]+)'\s*:\s*'(#[0-9a-fA-F]{3,8})'/g)];
    if (!(deck in DECK_VARIANTS)) {
      if (!reportedUnlisted.has(deck)) { reportedUnlisted.add(deck); errors.push(`${deck}: has a theme map but is not listed in DECK_VARIANTS in check.js`); }
      continue;
    }
    const bg = pairs.find(p => p[1] === 'bg');
    const mode = bg && norm(bg[2]) === norm(t.themes.dark.bg) ? 'dark' : 'light';
    for (const [, n, v] of pairs) {
      if (!names.has(n)) errors.push(`${deck}: theme variable --${n} is not a token name`);
      else if (!allowed(mode, n, deck).includes(norm(v))) errors.push(`${deck}: ${mode} --${n} is ${v}, tokens.json has ${allowed(mode, n, deck).join(' or ')}`);
    }
  }
}
for (const h of Object.keys(t.untokenised.colors)) {
  if (!usedHex.has(norm(h))) console.warn(`note: untokenised color ${h} is no longer used by any deck; remove it from tokens.json`);
}

// Generated files must be current.
for (const [file, content] of Object.entries(generate(t))) {
  const p = path.join(root, file);
  if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== content) errors.push(`packages/design/${file} is out of date; run npm run build`);
}

if (errors.length) {
  console.error(`check:tokens failed with ${errors.length} problem(s):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`check:tokens ok: ${decks.length} decks, ${usedHex.size} colors, ${names.size} variables, generated files current`);
