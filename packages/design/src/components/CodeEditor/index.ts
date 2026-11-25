// @kairos-io/design/code-editor: a separate entry so that CodeMirror is only
// loaded by pages that show an editor. The default export suits React.lazy:
//   const CodeEditor = lazy(() => import("@kairos-io/design/code-editor"));
import { CodeEditor } from "./CodeEditor.tsx";

export {
  CodeEditor,
  type CodeEditorDiagnostic,
  type CodeEditorLint,
  type CodeEditorProps,
} from "./CodeEditor.tsx";
export { YAML_LITERAL, yamlIndentAfter } from "./yaml.ts";
export default CodeEditor;
export type { CodeEditorVariant } from "./theme.ts";
