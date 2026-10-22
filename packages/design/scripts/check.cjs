#!/usr/bin/env node
// Fails when the decks and the package differ.
//  1. Every hex color in a deck exists in tokens.json (or is listed under untokenised).
//  2. Every var(--name) in a deck is a name tokens.css defines.
//  3. A deck links packages/design/tokens.css and carries no theme map of its own: it reads the tokens.
//  4. A deck's data-variant values are the ones DECK_VARIANTS allows for it.
//  5. tokens.css, tailwind.css and src/tokens/resolved.json equal what scripts/build.cjs writes now.
'use strict';
const fs = require('fs');
const path = require('path');
const { generate, loadTokens, tokenNames, root } = require('./build.cjs');

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
Object.values(t.color.base).forEach(addHex);
Object.values(t.color.brand).forEach(addHex);
Object.values(t.color.tile ?? {}).forEach(addHex);
Object.values(t.color.status).forEach(addHex);
Object.keys(t.untokenised.colors).forEach(addHex);
for (const mode of ['light', 'dark']) {
  Object.values(t.themes[mode]).forEach(addHex);
  for (const v of Object.values(t.variants)) Object.values(v[mode]).forEach(addHex);
}
const names = tokenNames(t);

// Which variants each deck may set with data-variant. A deck not listed here may set none.
// A new deck that needs a variant is added on purpose.
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

const decks = fs.readdirSync(repo).filter(f => f.endsWith('.dc.html')).sort();
for (const k of Object.keys(DECK_VARIANTS)) if (!decks.includes(k)) errors.push(`DECK_VARIANTS in check.cjs lists ${k}, but there is no such deck; renamed or deleted?`);
for (const vs of Object.values(DECK_VARIANTS)) for (const vn of vs) if (!t.variants[vn]) errors.push(`check.cjs lists variant ${vn}, which tokens.json does not have`);
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
  if (!/<link[^>]+href="packages\/design\/tokens\.css"/.test(src)) errors.push(`${deck}: does not link packages/design/tokens.css`);
  if (/\{[^{}]*'--bg'[^{}]*\}/.test(src)) errors.push(`${deck}: carries a theme map of its own; use data-theme and the tokens`);
  const allowed = DECK_VARIANTS[deck] || [];
  for (const m of new Set([...src.matchAll(/data-variant="([^"]*)"/g)].map(x => x[1]))) {
    for (const vn of m.split(/\s+/).filter(Boolean)) {
      if (!t.variants[vn]) errors.push(`${deck}: data-variant="${vn}" is not a variant in tokens.json`);
      else if (!allowed.includes(vn)) errors.push(`${deck}: data-variant="${vn}" is not listed for this deck in DECK_VARIANTS in check.cjs`);
    }
  }
}
for (const h of Object.keys(t.untokenised.colors)) {
  if (!usedHex.has(norm(h))) console.warn(`note: untokenised color ${h} is no longer used by any deck; remove it from tokens.json`);
}

// The npm tarball carries its own copy of the licence, because npm pack cannot
// reach a parent directory's LICENSE. Nothing else keeps the two in step.
{
  const here = path.join(root, 'LICENSE');
  const top = path.join(repo, 'LICENSE');
  if (!fs.existsSync(here)) errors.push('packages/design/LICENSE is missing; the npm tarball would ship Apache-2.0 code with no licence text. Copy the repository root LICENSE.');
  else if (fs.readFileSync(here, 'utf8') !== fs.readFileSync(top, 'utf8')) errors.push('packages/design/LICENSE differs from the repository root LICENSE; copy the root file over it.');
}

// The decks load assets/fonts/fonts.css and the package loads its own copy.
// They are the same stylesheet over the same four files, so a face added to one
// (the metric-matched fallbacks) has to be in the other, or deck text reflows on
// the swap where Storybook's does not.
{
  const deckFonts = path.join(repo, 'assets', 'fonts', 'fonts.css');
  const pkgFonts = path.join(root, 'src', 'assets', 'fonts', 'fonts.css');
  for (const f of [deckFonts, pkgFonts]) if (!fs.existsSync(f)) errors.push(`${path.relative(repo, f)} is missing`);
  if (fs.existsSync(deckFonts) && fs.existsSync(pkgFonts) && fs.readFileSync(deckFonts, 'utf8') !== fs.readFileSync(pkgFonts, 'utf8')) {
    errors.push('assets/fonts/fonts.css and packages/design/src/assets/fonts/fonts.css differ; the decks and the package load the same faces, so copy one over the other.');
  }
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
