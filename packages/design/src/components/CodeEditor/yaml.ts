// The two things CodeMirror's YAML mode leaves out that a cloud-config editor
// needs: Enter after `key:` indents the next line, and scalar literals
// (true, false, null, numbers) get their own colour. lang-yaml tags every
// plain scalar as `content`, so a literal cannot be told from a word by the
// highlighter; a decoration over the syntax tree does it instead.
import { EditorSelection, type Extension, RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";
import { getIndentUnit, syntaxTree } from "@codemirror/language";
import { insertNewlineAndIndent } from "@codemirror/commands";

// The YAML 1.1 words cloud-init still reads as booleans, null, and numbers in
// the forms YAML 1.2 knows.
export const YAML_LITERAL =
  /^(?:true|false|yes|no|on|off|null|~|[-+]?(?:\.inf|\.nan)|[-+]?\d[\d_]*(?:\.\d*)?(?:[eE][-+]?\d+)?|[-+]?\.\d+(?:[eE][-+]?\d+)?|0x[\da-fA-F]+|0o[0-7]+)$/i;

const literalMark = Decoration.mark({ class: "cm-kairos-literal" });

function literals(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const tree = syntaxTree(view.state);
  for (const { from, to } of view.visibleRanges) {
    tree.iterate({
      from,
      to,
      enter(node) {
        if (node.name !== "Literal") return;
        // A key is never a literal, even `true:`.
        if (node.node.parent?.name === "Key") return false;
        const text = view.state.doc.sliceString(node.from, node.to);
        if (YAML_LITERAL.test(text)) builder.add(node.from, node.to, literalMark);
        return false;
      },
    });
  }
  return builder.finish();
}

const literalHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = literals(view);
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged || syntaxTree(u.startState) !== syntaxTree(u.state)) {
        this.decorations = literals(u.view);
      }
    }
  },
  { decorations: (v) => v.decorations },
);

// The text of a line before the cursor, without a trailing comment. A `#` only
// starts a comment at the line start or after a space, and not inside quotes.
function stripComment(text: string): string {
  let quote: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === "#" && (i === 0 || /\s/.test(text[i - 1] ?? ""))) {
      return text.slice(0, i);
    }
  }
  return text;
}

const OPENER =
  /^(\s*)((?:-\s+)*)(?:"(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s#'"-][^#]*?|-[^\s#][^#]*?)\s*:(?:\s+[|>][-+0-9]*)?$/;

/**
 * The indentation the line after `before` should get, or null when the line
 * opens nothing. `key:`, `- key:`, `key: |` and `key: >-` open a block one
 * unit deeper than the key.
 */
export function yamlIndentAfter(before: string, unit: number): number | null {
  const text = stripComment(before).replace(/\s+$/, "");
  const m = OPENER.exec(text);
  if (!m) return null;
  return (m[1]?.length ?? 0) + (m[2]?.length ?? 0) + unit;
}

/**
 * The indentation that keeps a new line level with the one it follows. Under
 * `- name: x` the next line is another key of the same item, so it lines up
 * with `name`; under a scalar item (`- /opt`) it is a sibling at the dash.
 */
export function yamlKeepIndent(before: string): number {
  const m = /^(\s*)((?:-\s+)*)(.*)$/.exec(before);
  const spaces = m?.[1]?.length ?? 0;
  const dashes = m?.[2]?.length ?? 0;
  const rest = stripComment(m?.[3] ?? "");
  const mapping = /^(?:"(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s#'"][^#]*?):(?:\s|$)/.test(rest);
  return spaces + (mapping ? dashes : 0);
}

/**
 * Enter for YAML: one unit deeper after a key that opens a block, otherwise
 * level with the line above. Trailing spaces before the cursor are dropped.
 * A selection that spans lines gets CodeMirror's own newline.
 */
export function yamlEnter(view: EditorView): boolean {
  const { state } = view;
  if (state.readOnly) return false;
  const multiline = state.selection.ranges.some(
    (r) => state.doc.lineAt(r.from).number !== state.doc.lineAt(r.to).number,
  );
  if (multiline) return insertNewlineAndIndent(view);
  const unit = getIndentUnit(state);
  view.dispatch(
    state.changeByRange((range) => {
      const line = state.doc.lineAt(range.from);
      const before = line.text.slice(0, range.from - line.from);
      const indent = yamlIndentAfter(before, unit) ?? yamlKeepIndent(before);
      const from = range.from - (/\s*$/.exec(before)?.[0].length ?? 0);
      const insert = "\n" + " ".repeat(indent);
      return { changes: { from, to: range.to, insert }, range: EditorSelection.cursor(from + insert.length) };
    }),
    { scrollIntoView: true, userEvent: "input" },
  );
  return true;
}

/** The literal colouring, for a YAML document. */
export function yamlLiterals(): Extension {
  return literalHighlighter;
}
