import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";
import { YAML_LITERAL, yamlEnter, yamlIndentAfter, yamlKeepIndent } from "./yaml.ts";

describe("yamlIndentAfter", () => {
  it.each([
    ["key:", 2],
    ["  - name:", 6],
    ["key: |", 2],
    ["key: >-", 2],
    ["key: # comment", 2],
    ['"quoted key":', 2],
    ["  install:", 4],
  ])("opens a block after %j", (line, indent) => {
    expect(yamlIndentAfter(line, 2)).toBe(indent);
  });

  it.each(["key: value", 'url: "http://x:"', "msg: 'a: b'", "hostname", ""])(
    "opens nothing after %j",
    (line) => {
      expect(yamlIndentAfter(line, 2)).toBeNull();
    },
  );

  it("uses the indent unit it is given", () => {
    expect(yamlIndentAfter("key:", 4)).toBe(4);
  });
});

describe("YAML_LITERAL", () => {
  it.each(["true", "false", "yes", "no", "null", "~", "42", "-3.5", "0x1F", "TRUE"])("matches %j", (word) => {
    expect(YAML_LITERAL.test(word)).toBe(true);
  });

  it.each(["truex", "edge-01", "kairos", ""])("does not match %j", (word) => {
    expect(YAML_LITERAL.test(word)).toBe(false);
  });
});

describe("yamlEnter", () => {
  const views: EditorView[] = [];
  afterEach(() => views.splice(0).forEach((v) => v.destroy()));

  // A view with the cursor at the end of `doc`.
  const viewOf = (doc: string, readOnly = false) => {
    const view = new EditorView({
      parent: document.body,
      state: EditorState.create({
        doc,
        selection: EditorSelection.cursor(doc.length),
        extensions: [indentUnit.of("  "), EditorState.readOnly.of(readOnly)],
      }),
    });
    views.push(view);
    return view;
  };

  it("indents one unit after a key that opens a block", () => {
    const view = viewOf("install:");
    expect(yamlEnter(view)).toBe(true);
    expect(view.state.doc.toString()).toBe("install:\n  ");
    expect(view.state.selection.main.head).toBe(view.state.doc.length);
  });

  it("keeps the line's indent after a key with a value", () => {
    const view = viewOf("install:\n  device: auto");
    yamlEnter(view);
    expect(view.state.doc.toString()).toBe("install:\n  device: auto\n  ");
  });

  it("drops trailing spaces before the cursor", () => {
    const view = viewOf("install:   ");
    yamlEnter(view);
    expect(view.state.doc.toString()).toBe("install:\n  ");
  });

  it("does nothing in a read-only editor", () => {
    const view = viewOf("install:", true);
    expect(yamlEnter(view)).toBe(false);
    expect(view.state.doc.toString()).toBe("install:");
  });
});

describe("yamlKeepIndent", () => {
  it.each([
    ["- /opt", 0],
    ["  - /var/lib/longhorn", 2],
    ["- name: x", 2],
    ["  - name: kairos", 4],
    ["    passwd: kairos", 4],
    ['- "a: b"', 0],
  ])("keeps %j at %i", (line, indent) => {
    expect(yamlKeepIndent(line)).toBe(indent);
  });
});
