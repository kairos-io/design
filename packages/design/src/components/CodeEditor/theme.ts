// The editor's look, in two grounds.
//
// "code" is the installer deck's YAML editor: the code ground in both themes, a
// 44px gutter on the bar colour, Martian Mono at 14px with a 1.85 line height,
// keys in the key colour, comments muted, literals in the code ok green.
//
// "surface" is the same editor on the page's own form surface, for a config
// edited inside a form rather than shown as a terminal. It follows the theme,
// so its colours have to read on the light surface and the dark one alike.
// The code palette cannot: --code-key is 2.05:1 on the light surface. These
// are the semantic
// tokens that already pass AA on both, measured against --surface:
//
//   keys      --link    6.81 light / 6.14 dark
//   literals  --ok      5.24 / 5.94
//   comments  --muted   6.79 / 6.93
//   text      --ink    17.05 / 14.65
//
// --accent is deliberately not used for text here: it is 3.63:1 on white,
// under AA. It appears only as a selection wash, where it is not text.
//
// Every colour is a token, so both grounds follow tokens.css and data-variant
// with no second theme here.
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { tags as t } from "@lezer/highlight";

export type CodeEditorVariant = "code" | "surface";

interface Palette {
  ground: string;
  bar: string;
  text: string;
  faint: string;
  key: string;
  literal: string;
  selection: string;
  /** The form surface needs an edge; the code ground reads as its own panel. */
  border?: string;
  dark: boolean;
}

const PALETTES: Record<CodeEditorVariant, Palette> = {
  code: {
    ground: "var(--code)",
    bar: "var(--code-bar)",
    text: "var(--code-ink)",
    faint: "var(--code-muted)",
    key: "var(--code-key)",
    literal: "var(--code-ok)",
    selection: "color-mix(in srgb, var(--code-key) 32%, transparent)",
    dark: true,
  },
  surface: {
    ground: "var(--surface)",
    bar: "var(--bg)",
    text: "var(--ink)",
    faint: "var(--muted)",
    key: "var(--link)",
    literal: "var(--ok)",
    selection: "color-mix(in srgb, var(--accent) 24%, transparent)",
    // 1.5px of line, as Input and Textarea draw their edge.
    border: "1.5px solid var(--line)",
    dark: false,
  },
};

function buildHighlight(p: Palette) {
  return syntaxHighlighting(
    HighlightStyle.define([
      { tag: [t.propertyName, t.definition(t.propertyName)], color: p.key },
      { tag: [t.comment, t.lineComment], color: p.faint },
      { tag: [t.meta, t.labelName, t.typeName, t.special(t.string), t.keyword], color: p.faint },
      { tag: [t.bool, t.number, t.null, t.atom], color: p.literal },
      {
        tag: [t.string, t.content, t.separator, t.punctuation, t.squareBracket, t.brace],
        color: p.text,
      },
    ]),
  );
}

function buildTheme(p: Palette) {
  return EditorView.theme(
    {
      "&": {
        backgroundColor: p.ground,
        color: p.text,
        fontSize: "14px",
        borderRadius: "var(--radius-base)",
        overflow: "hidden",
        maxHeight: "var(--kairos-editor-max, none)",
        ...(p.border ? { border: p.border } : {}),
      },
      // The focus ring sits outside the editor, as lib/focus.ts draws it: 2px of
      // ink, offset 2. Held inside on the code ground it was a near-white bar
      // laid over the first and last lines rather than a ring.
      "&.cm-focused": { outline: "none" },
      "&:has(.cm-content:focus-visible)": { outline: "2px solid var(--ink)", outlineOffset: "2px" },
      // Heights come from the host's minHeight and maxHeight props.
      ".cm-content, .cm-gutter": { minHeight: "var(--kairos-editor-min, 0)" },
      // 1.5px, the weight Input and Textarea turn to the recovery red.
      "&:has(.cm-content[aria-invalid=true])": {
        boxShadow: "inset 0 0 0 1.5px var(--status-recovery)",
      },
      ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.85", overflow: "auto" },
      ".cm-content": { padding: "16px 0", caretColor: p.text },
      ".cm-line": { padding: "0 18px" },
      ".cm-gutters": { backgroundColor: p.bar, color: p.faint, border: "none", userSelect: "none" },
      // Three digits are reserved, as an editor does, so the gutter does not
      // widen and shove the code sideways the moment a document reaches line 10.
      // The floor is on the gutter itself: CodeMirror sizes it from a hidden
      // spacer holding the largest line number, so a min-width on the element
      // does nothing. Past 999 lines it grows once, which is the right trade.
      ".cm-gutter.cm-lineNumbers": { minWidth: "calc(3ch + 14px)" },
      ".cm-lineNumbers .cm-gutterElement": { padding: "0 7px", textAlign: "right" },
      ".cm-activeLine": { backgroundColor: `color-mix(in srgb, ${p.text} 5%, transparent)` },
      ".cm-activeLineGutter": { backgroundColor: "transparent", color: p.text },
      "&:not(.cm-focused) .cm-activeLine": { backgroundColor: "transparent" },
      "&:not(.cm-focused) .cm-activeLineGutter": { color: "inherit" },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: p.text, borderLeftWidth: "2px" },
      // The browser paints the selection, not drawSelection: its rectangles are
      // measured from the text box, so at a 1.85 line height the first and last
      // row of a selection came out 17px tall against a 25.9px line, notched top
      // and bottom. Native selection fills the line box.
      ".cm-content ::selection": { backgroundColor: p.selection },
      ".cm-kairos-literal, .cm-kairos-literal *": { color: p.literal },
      ".cm-placeholder": { color: p.faint },
      ".cm-matchingBracket": { backgroundColor: p.bar, outline: `1px solid ${p.faint}` },
      ".cm-foldPlaceholder": { backgroundColor: p.bar, border: "none", color: p.faint },

      // Lint: a wavy underline in the recovery red (3:1 as a mark, which is
      // what a non-text indicator needs), the message in ink on the bar.
      ".cm-lintRange-error": {
        backgroundImage: "none",
        textDecoration: "underline wavy var(--status-recovery)",
        textUnderlineOffset: "3px",
      },
      ".cm-lintRange-warning": {
        backgroundImage: "none",
        textDecoration: "underline wavy var(--status-warning)",
        textUnderlineOffset: "3px",
      },
      ".cm-lintRange-info, .cm-lintRange-hint": {
        backgroundImage: "none",
        textDecoration: `underline dotted ${p.faint}`,
        textUnderlineOffset: "3px",
      },
      ".cm-tooltip": {
        backgroundColor: p.bar,
        color: p.text,
        border: `1px solid color-mix(in srgb, ${p.faint} 30%, transparent)`,
        borderRadius: "var(--radius-base)",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
      },
      ".cm-diagnostic": { padding: "6px 10px", borderLeft: `3px solid ${p.faint}` },
      ".cm-diagnostic-error": { borderLeftColor: "var(--status-recovery)" },
      ".cm-diagnostic-warning": { borderLeftColor: "var(--status-warning)" },
      ".cm-lint-marker": { width: "0.8em", height: "0.8em" },
      // The gutter is the marker plus its own padding, so the code never butts
      // against the icon: 4px in from the line numbers, 8px before the first
      // character.
      ".cm-gutter-lint": { width: "calc(0.8em + 12px)" },
      ".cm-gutter-lint .cm-gutterElement": {
        padding: "0 8px 0 4px",
        display: "flex",
        alignItems: "center",
      },
    },
    { dark: p.dark },
  );
}

const BUILT: Record<CodeEditorVariant, Extension[]> = {
  code: [buildTheme(PALETTES.code), buildHighlight(PALETTES.code)],
  surface: [buildTheme(PALETTES.surface), buildHighlight(PALETTES.surface)],
};

/** The theme and the syntax colours for a ground, as one extension. */
export function themeFor(variant: CodeEditorVariant): Extension[] {
  return BUILT[variant];
}

/** The code ground, kept as a named export for anything that wants it directly. */
export const kairosTheme = BUILT.code[0];
export const kairosHighlight = BUILT.code[1];
