import * as React from "react";
import { Annotation, Compartment, EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers as lineNumberGutter,
  placeholder as placeholderExt,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentLess, indentMore } from "@codemirror/commands";
import { bracketMatching, indentUnit } from "@codemirror/language";
import { yaml } from "@codemirror/lang-yaml";
import { themeFor, type CodeEditorVariant } from "./theme.ts";
import { yamlEnter, yamlLiterals } from "./yaml.ts";

/** A problem the `lint` hook found. Give a line (1-based) or offsets. */
export interface CodeEditorDiagnostic {
  /** 1-based line. With `column`, the mark starts there; without, it covers the line. */
  line?: number;
  /** 1-based column on `line`. */
  column?: number;
  /** Document offsets, for a linter that reports them; they win over `line`. */
  from?: number;
  to?: number;
  message: string;
  severity?: "error" | "warning" | "info";
}

export type CodeEditorLint = (doc: string) => CodeEditorDiagnostic[] | Promise<CodeEditorDiagnostic[]>;

export interface CodeEditorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "children"
> {
  /** The text, for a controlled editor. */
  value?: string;
  /** The starting text, for an uncontrolled one. */
  defaultValue?: string;
  /** Called with the whole text after every edit the user makes. */
  onChange?: (value: string) => void;
  /** "yaml" (the default) or "text" for no syntax colouring. */
  language?: "yaml" | "text";
  /** Selectable and copyable, but not editable. Tab moves focus instead of indenting. */
  readOnly?: boolean;
  /**
   * The ground it is drawn on. "code" (the default) is the dark code panel in
   * both themes, as a terminal is. "surface" is the page's own form surface,
   * for a config edited inside a form: it follows the theme, and its syntax
   * colours are the semantic tokens that pass AA on a light ground and a dark
   * one alike.
   */
  variant?: CodeEditorVariant;
  /** The numbered gutter. On by default. */
  lineNumbers?: boolean;
  /** Soft-wraps long lines. On by default; off scrolls sideways. */
  wrap?: boolean;
  /** Spaces per indent level. 2 by default. */
  tabSize?: number;
  /** Shown while the editor is empty. */
  placeholder?: string;
  /**
   * Checks the text and returns what is wrong with it: a schema check, a
   * YAML parse. Runs after typing pauses. The lint code loads only when this
   * is set, so an editor without it does not pay for it.
   */
  lint?: CodeEditorLint;
  /** Milliseconds of quiet before `lint` runs. 300 by default. */
  lintDelay?: number;
  /** The editor's min height (CSS length or px). */
  minHeight?: string | number;
  /** The editor's max height; it scrolls past it. */
  maxHeight?: string | number;
  /** Focus the editor on mount. */
  autoFocus?: boolean;
  /** Extra CodeMirror extensions, appended last. */
  extensions?: Extension[];
  /** Receives the EditorView once it exists, and null when it goes. */
  onView?: (view: EditorView | null) => void;
  /** The accessible name, when there is no visible label to point at. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
  /** Set by Field; read as aria-required. */
  required?: boolean;
}

// Marks a change that came in through `value`, so it is not reported back
// through onChange as if the user had typed it.
const external = Annotation.define<boolean>();

const css = (v: string | number | undefined) => (typeof v === "number" ? `${v}px` : v);

function toCm(diag: CodeEditorDiagnostic, state: EditorState) {
  const len = state.doc.length;
  let from = diag.from;
  let to = diag.to;
  if (from === undefined && diag.line !== undefined) {
    const n = Math.min(Math.max(1, diag.line), state.doc.lines);
    const line = state.doc.line(n);
    if (diag.column !== undefined) {
      from = Math.min(line.from + Math.max(0, diag.column - 1), line.to);
      // To the end of the word at the column, or one character.
      const rest = /^\S+/.exec(state.doc.sliceString(from, line.to));
      to = from + Math.max(1, rest?.[0].length ?? 1);
    } else {
      from = line.from + (/^\s*/.exec(line.text)?.[0].length ?? 0);
      to = line.to;
    }
  }
  from = Math.min(Math.max(0, from ?? 0), len);
  to = Math.min(Math.max(from, to ?? from), len);
  return { from, to, message: diag.message, severity: diag.severity ?? "error" };
}

/**
 * A code editor for cloud configs and other YAML, built on CodeMirror 6 and
 * drawn like the installer deck's editor: the dark code ground in both
 * themes, the numbered gutter on the bar colour, keys in the key colour and
 * literals in green. Enter after `key:` indents the next line; Tab and
 * Shift+Tab indent and outdent (Escape, then Tab, leaves the editor). It
 * keeps undo, selection and paste as an editor does, which a textarea
 * cannot. Import it from `@kairos-io/design/code-editor`, ideally lazily,
 * so pages without an editor do not load CodeMirror.
 */
export const CodeEditor = React.forwardRef<HTMLDivElement, CodeEditorProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      language = "yaml",
      readOnly = false,
      lineNumbers = true,
      variant = "code",
      wrap = true,
      tabSize = 2,
      placeholder,
      lint,
      lintDelay = 300,
      minHeight,
      maxHeight,
      autoFocus = false,
      extensions,
      onView,
      className,
      style,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      "aria-required": ariaRequiredProp,
      required,
      id,
      ...props
    },
    ref,
  ) => {
    const ariaRequired = ariaRequiredProp ?? (required ? true : undefined);
    // A <label for> cannot name or focus a contenteditable, so an editor with
    // an id and no other name looks up its label (Field renders one) and
    // points aria-labelledby at it; clicking the label focuses the editor.
    const [labelId, setLabelId] = React.useState<string | undefined>(undefined);
    const host = React.useRef<HTMLDivElement | null>(null);
    const view = React.useRef<EditorView | null>(null);
    // One compartment per prop group, so a prop change swaps only its part.
    const [c] = React.useState(() => ({
      language: new Compartment(),
      surface: new Compartment(),
      readOnly: new Compartment(),
      gutter: new Compartment(),
      wrap: new Compartment(),
      indent: new Compartment(),
      placeholder: new Compartment(),
      attrs: new Compartment(),
      lint: new Compartment(),
      extra: new Compartment(),
    }));

    // Callbacks are read through refs so that a new function each render
    // does not rebuild the editor.
    const onChangeRef = React.useRef(onChange);
    const lintRef = React.useRef(lint);
    const onViewRef = React.useRef(onView);
    const languageRef = React.useRef(language);
    React.useLayoutEffect(() => {
      onChangeRef.current = onChange;
      lintRef.current = lint;
      onViewRef.current = onView;
      languageRef.current = language;
    });

    const setHost = React.useCallback(
      (node: HTMLDivElement | null) => {
        host.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // A tab size reaches us from a control or a config file, so it can arrive
    // empty, null, zero, negative or fractional. CodeMirror rejects an empty
    // indent unit ("Invalid indent unit") and that throw takes the whole
    // editor down, so it is coerced to a whole number of at least one space.
    const indentWidth = Math.max(1, Math.floor(Number(tabSize)) || 2);

    const config = {
      surface: themeFor(variant),
      language: language === "yaml" ? [yaml(), yamlLiterals()] : [],
      readOnly: [EditorState.readOnly.of(readOnly)],
      gutter: lineNumbers ? [lineNumberGutter(), highlightActiveLineGutter()] : [],
      wrap: wrap ? EditorView.lineWrapping : [],
      indent: [indentUnit.of(" ".repeat(indentWidth)), EditorState.tabSize.of(indentWidth)],
      placeholder: placeholder ? placeholderExt(placeholder) : [],
      attrs: EditorView.contentAttributes.of(
        Object.fromEntries(
          Object.entries({
            id,
            "aria-label": ariaLabel,
            "aria-labelledby": ariaLabelledBy ?? (ariaLabel ? undefined : labelId),
            "aria-describedby": ariaDescribedBy,
            "aria-invalid": ariaInvalid === undefined ? undefined : String(ariaInvalid),
            "aria-required": ariaRequired === undefined ? undefined : String(ariaRequired),
            "aria-readonly": readOnly ? "true" : undefined,
            "aria-multiline": "true",
          }).filter((e): e is [string, string] => e[1] !== undefined),
        ),
      ),
      extra: extensions ?? [],
    } satisfies Record<string, Extension>;
    const configRef = React.useRef(config);
    React.useLayoutEffect(() => {
      configRef.current = config;
    });

    // Created once. React's StrictMode mounts, unmounts and mounts again;
    // the cleanup destroys the first view, so only one is ever live.
    React.useLayoutEffect(() => {
      const parent = host.current;
      if (!parent) return;
      const cfg = configRef.current;
      const editor = new EditorView({
        parent,
        state: EditorState.create({
          doc: value ?? defaultValue ?? "",
          extensions: [
            history(),
            // No drawSelection: it measures its rectangles from the text box, so at
            // a 1.85 line height the first and last row of a selection came out
            // 17px against a 25.9px line. The browser's own selection fills the
            // line box. The cost is that a second selection range would not be
            // drawn, and nothing here makes one.
            highlightActiveLine(),
            bracketMatching(),
            // Tab and Shift+Tab indent only while the editor is editable, so a
            // read-only editor stays in the page's tab order.
            keymap.of([
              { key: "Enter", run: (v) => languageRef.current === "yaml" && yamlEnter(v) },
              {
                key: "Tab",
                run: (v) => (v.state.readOnly ? false : indentMore(v)),
                shift: (v) => (v.state.readOnly ? false : indentLess(v)),
              },
              ...defaultKeymap,
              ...historyKeymap,
            ]),
            c.surface.of(cfg.surface),
            c.language.of(cfg.language),
            c.readOnly.of(cfg.readOnly),
            c.gutter.of(cfg.gutter),
            c.wrap.of(cfg.wrap),
            c.indent.of(cfg.indent),
            c.placeholder.of(cfg.placeholder),
            c.attrs.of(cfg.attrs),
            c.lint.of([]),
            c.extra.of(cfg.extra),
            EditorView.updateListener.of((u) => {
              if (!u.docChanged) return;
              if (u.transactions.every((tr) => tr.annotation(external))) return;
              onChangeRef.current?.(u.state.doc.toString());
            }),
          ],
        }),
      });
      view.current = editor;
      onViewRef.current?.(editor);
      if (autoFocus) editor.focus();
      return () => {
        onViewRef.current?.(null);
        editor.destroy();
        view.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // `value` is synced before paint, and only when it differs from the
    // editor's text: under Preact a passive effect runs a frame late, and
    // writing back an echo of what the user just typed undoes their next
    // keystrokes and, typed fast enough, freezes the page.
    React.useLayoutEffect(() => {
      const editor = view.current;
      if (!editor || value === undefined) return;
      const current = editor.state.doc.toString();
      if (value === current) return;
      editor.dispatch({
        changes: { from: 0, to: current.length, insert: value },
        annotations: [external.of(true)],
      });
    }, [value]);

    // Each compartment is swapped only when its own inputs change.
    useReconfigure(view, c.surface, config.surface, [variant]);
    useReconfigure(view, c.language, config.language, [language]);
    useReconfigure(view, c.readOnly, config.readOnly, [readOnly]);
    useReconfigure(view, c.gutter, config.gutter, [lineNumbers]);
    useReconfigure(view, c.wrap, config.wrap, [wrap]);
    useReconfigure(view, c.indent, config.indent, [indentWidth]);
    useReconfigure(view, c.placeholder, config.placeholder, [placeholder]);
    useReconfigure(view, c.attrs, config.attrs, [
      id,
      ariaLabel,
      ariaLabelledBy,
      labelId,
      ariaDescribedBy,
      ariaInvalid,
      ariaRequired,
      readOnly,
    ]);
    useReconfigure(view, c.extra, config.extra, [extensions]);

    React.useLayoutEffect(() => {
      if (!id || ariaLabel || ariaLabelledBy) return;
      const root = host.current?.getRootNode() as Document | ShadowRoot | undefined;
      const label = root?.querySelector?.<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`);
      if (!label) return;
      if (!label.id) label.id = `${id}-label`;
      setLabelId(label.id);
      const focus = (e: MouseEvent) => {
        e.preventDefault();
        view.current?.focus();
      };
      label.addEventListener("click", focus);
      return () => label.removeEventListener("click", focus);
    }, [id, ariaLabel, ariaLabelledBy]);

    // Lint is loaded on first use. The source reads the hook through a ref,
    // so a new function each render keeps the same linter.
    const hasLint = lint !== undefined;
    React.useEffect(() => {
      const editor = view.current;
      if (!editor) return;
      if (!hasLint) {
        editor.dispatch({ effects: c.lint.reconfigure([]) });
        return;
      }
      let live = true;
      void import("@codemirror/lint").then(({ linter, lintGutter }) => {
        if (!live || !view.current) return;
        view.current.dispatch({
          effects: c.lint.reconfigure([
            linter(
              async (v) => {
                const run = lintRef.current;
                if (!run) return [];
                const found = await run(v.state.doc.toString());
                return found.map((d) => toCm(d, v.state));
              },
              { delay: lintDelay },
            ),
            lineNumbers ? lintGutter() : [],
          ]),
        });
      });
      return () => {
        live = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasLint, lintDelay, lineNumbers]);

    return (
      <div
        ref={setHost}
        className={["kairos-code-editor", className].filter(Boolean).join(" ")}
        data-readonly={readOnly ? "" : undefined}
        style={{
          ...style,
          // CodeMirror sizes .cm-editor; the host passes the limits through.
          ["--kairos-editor-min" as string]: css(minHeight),
          ["--kairos-editor-max" as string]: css(maxHeight),
        }}
        {...props}
      />
    );
  },
);
CodeEditor.displayName = "CodeEditor";

// Swaps a compartment's extension when its inputs change, skipping the
// first render, where the editor is created with it already.
function useReconfigure(
  view: React.RefObject<EditorView | null>,
  compartment: Compartment,
  extension: Extension,
  deps: React.DependencyList,
) {
  const first = React.useRef(true);
  React.useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    view.current?.dispatch({ effects: compartment.reconfigure(extension) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
