import { act, render, screen, waitFor } from "@testing-library/react";
import type { EditorView } from "@codemirror/view";
import { CodeEditor } from "./CodeEditor.tsx";
import { yamlEnter } from "./yaml.ts";

// Renders the editor and hands back its EditorView: jsdom cannot drive
// contenteditable typing, so behaviour is driven through the view.
function setup(ui: (onView: (v: EditorView | null) => void) => React.ReactElement) {
  let view: EditorView | null = null;
  const utils = render(ui((v) => (view = v)));
  if (!view) throw new Error("no view");
  return { ...utils, view: view as EditorView };
}

describe("CodeEditor", () => {
  it("is a named textbox showing its text", () => {
    render(<CodeEditor aria-label="Cloud config" defaultValue={"#cloud-config\nhostname: edge-01"} />);
    const box = screen.getByRole("textbox", { name: "Cloud config" });
    expect(box).toHaveClass("cm-content");
    expect(box).toHaveAttribute("aria-multiline", "true");
    expect(box).toHaveTextContent("hostname: edge-01");
  });

  it("is read-only when asked", () => {
    const { view } = setup((onView) => (
      <CodeEditor aria-label="Cloud config" defaultValue="a: 1" readOnly onView={onView} />
    ));
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-readonly", "true");
    expect(view.state.readOnly).toBe(true);
  });

  it("shows line numbers by default and hides them when asked", () => {
    const { container, unmount } = render(<CodeEditor aria-label="Cloud config" defaultValue="a" />);
    expect(container.querySelector(".cm-lineNumbers")).not.toBeNull();
    unmount();
    const off = render(<CodeEditor aria-label="Cloud config" defaultValue="a" lineNumbers={false} />);
    expect(off.container.querySelector(".cm-lineNumbers")).toBeNull();
  });

  it("reports a user edit with the whole text", () => {
    const onChange = vi.fn();
    const { view } = setup((onView) => (
      <CodeEditor aria-label="Cloud config" defaultValue="hostname:" onChange={onChange} onView={onView} />
    ));
    act(() => {
      view.dispatch({ changes: { from: view.state.doc.length, insert: " edge-01" }, userEvent: "input" });
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("hostname: edge-01");
  });

  it("takes a controlled value without echoing it through onChange", () => {
    const onChange = vi.fn();
    let view: EditorView | null = null;
    const onView = (v: EditorView | null) => (view = v);
    const { rerender } = render(
      <CodeEditor aria-label="Cloud config" value="a: 1" onChange={onChange} onView={onView} />,
    );
    rerender(<CodeEditor aria-label="Cloud config" value="a: 2" onChange={onChange} onView={onView} />);
    expect(view!.state.doc.toString()).toBe("a: 2");
    expect(onChange).not.toHaveBeenCalled();

    // The same value as the editor holds changes nothing.
    const before = view!.state;
    rerender(<CodeEditor aria-label="Cloud config" value="a: 2" onChange={onChange} onView={onView} />);
    expect(view!.state).toBe(before);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("indents after a key that opens a block on Enter", () => {
    const { view } = setup((onView) => (
      <CodeEditor aria-label="Cloud config" defaultValue="install:" onView={onView} />
    ));
    act(() => {
      view.dispatch({ selection: { anchor: view.state.doc.length } });
      yamlEnter(view);
    });
    expect(view.state.doc.toString()).toBe("install:\n  ");
  });

  it("colours scalar literals", async () => {
    const { container } = render(<CodeEditor aria-label="Cloud config" defaultValue="enabled: true" />);
    await waitFor(() => {
      const marks = Array.from(container.querySelectorAll(".cm-kairos-literal")).map((n) => n.textContent);
      expect(marks).toEqual(["true"]);
    });
  });

  it("runs lint with the text", async () => {
    const lint = vi.fn(() => [{ line: 1, message: "bad" }]);
    render(<CodeEditor aria-label="Cloud config" defaultValue="a: [" lint={lint} lintDelay={0} />);
    await waitFor(() => expect(lint).toHaveBeenCalledWith("a: ["));
  });

  it("gives onView null when it unmounts", () => {
    const onView = vi.fn();
    const { unmount } = render(<CodeEditor aria-label="Cloud config" onView={onView} />);
    unmount();
    expect(onView).toHaveBeenLastCalledWith(null);
  });

  // A number control hands over "" between keystrokes, and " ".repeat(0) is an
  // empty indent unit, which CodeMirror rejects by throwing. That throw took
  // the whole editor down rather than the one prop.
  it("survives a tab size that arrives empty, zero, negative or fractional", () => {
    for (const bad of [0, -1, 2.5, "" as unknown as number, null as unknown as number]) {
      expect(() =>
        render(<CodeEditor aria-label={`Cloud config ${String(bad)}`} tabSize={bad} />),
      ).not.toThrow();
    }
  });

  it("indents by the tab size it is given", () => {
    const { view } = setup((onView) => (
      <CodeEditor aria-label="Cloud config" tabSize={4} value="users:" onView={onView} />
    ));
    act(() => {
      view.dispatch({ selection: { anchor: 6 } });
      yamlEnter(view);
    });
    expect(view.state.doc.toString()).toBe("users:\n    ");
  });
});
