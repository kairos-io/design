import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { parseDocument } from "yaml";
import { Field } from "../Field/Field.tsx";
import { CodeEditor, type CodeEditorDiagnostic } from "./CodeEditor.tsx";

const cloudConfig = `#cloud-config
hostname: edge-store-0142
users:
  - name: kairos
    passwd: kairos
    groups:
      - admin
    ssh_authorized_keys:
      - github:mauromorales
k3s:
  enabled: true
  args:
    - --disable=traefik
install:
  device: auto
  reboot: true
  poweroff: false
  partitions:
    oem:
      size: 64
stages:
  boot:
    - name: "Set the motd"
      files:
        - path: /etc/motd
          permissions: 0644
          content: |
            Welcome to edge-store-0142. # not a comment
            Managed by Kairos.`;

const meta = {
  title: "Components/CodeEditor",
  component: CodeEditor,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "The YAML editor of the installer's review step, built on CodeMirror 6 and drawn from the installer deck: the dark code ground in both themes, the numbered gutter on the bar colour, keys in the key colour, literals (`true`, `false`, numbers, `null`) in green, comments muted. Use it where an operator edits or reviews a cloud config; for a short snippet nobody edits, use Terminal, and for free text, Textarea.",
          "",
          "Enter after `key:` (or `- key:`, `key: |`) indents the next line by one level, and keeps the level otherwise. Tab and Shift+Tab indent and outdent the line or selection; to leave the editor with the keyboard, press Escape, then Tab. Undo, redo, selection and paste behave as in any editor.",
          "",
          'It is a separate entry, `@kairos-io/design/code-editor`, so nothing else in the package pulls CodeMirror in (about 100 KB gzipped). Load it lazily where it is needed: `const CodeEditor = React.lazy(() => import("@kairos-io/design/code-editor"))`. It works under Preact (preact/compat).',
        ].join("\n"),
      },
    },
  },
  argTypes: {
    readOnly: { control: "boolean" },
    lineNumbers: { control: "boolean" },
    wrap: { control: "boolean" },
    language: { control: "inline-radio", options: ["yaml", "text"] },
  },
  args: {
    "aria-label": "Cloud config",
    defaultValue: cloudConfig,
    readOnly: false,
    lineNumbers: true,
    wrap: true,
    language: "yaml",
    maxHeight: 420,
  },
} satisfies Meta<typeof CodeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "With `value` and `onChange`, as a form holds it. The editor reports every edit and takes outside changes (here the reset button) without reporting them back, so a parent that echoes the value does not loop.",
      },
    },
  },
  render: function Render(args) {
    const [value, setValue] = React.useState(cloudConfig);
    const lines = value.split("\n").length;
    return (
      <div className="grid max-w-2xl gap-2">
        <CodeEditor {...args} defaultValue={undefined} value={value} onChange={setValue} />
        <div className="flex items-center justify-between font-mono text-[13px] text-muted">
          <span>
            {lines} lines · {value.length} characters
          </span>
          <button
            type="button"
            className="rounded-sm px-1.5 py-0.5 text-link underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
            onClick={() => setValue(cloudConfig)}
          >
            Reset
          </button>
        </div>
      </div>
    );
  },
};

export const ReadOnly: Story = {
  name: "Read only",
  args: { readOnly: true },
  parameters: {
    docs: {
      description: {
        story:
          "For a config the operator reviews but does not change. The text stays selectable and copyable; Tab moves on through the page rather than indenting.",
      },
    },
  },
};

export const NoWrap: Story = {
  name: "No wrap",
  args: {
    wrap: false,
    defaultValue: `${cloudConfig}
    - ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl operator@edge-store-0142.fleet.example.internal`,
  },
  parameters: {
    docs: {
      description: {
        story: "Lines soft-wrap by default. With `wrap={false}` a long line scrolls sideways instead.",
      },
    },
  },
};

export const WithoutLineNumbers: Story = {
  name: "Without line numbers",
  args: { lineNumbers: false, defaultValue: "install:\n  device: auto\n  reboot: true" },
};

export const Empty: Story = {
  args: { defaultValue: "", placeholder: "#cloud-config", minHeight: 160 },
};

// A YAML parse plus two cloud-config rules, to show the lint hook. A real
// page would check the installer's schema here.
function lintCloudConfig(doc: string): CodeEditorDiagnostic[] {
  const out: CodeEditorDiagnostic[] = [];
  const lines = doc.split("\n");
  if (lines[0]?.trim() !== "#cloud-config") {
    out.push({ line: 1, message: "A cloud config starts with #cloud-config.", severity: "warning" });
  }
  const parsed = parseDocument(doc);
  for (const e of parsed.errors) {
    const [from, to] = e.pos;
    out.push({ from, to: Math.max(to, from + 1), message: e.message.split("\n")[0] ?? e.message });
  }
  const install = parsed.toJS({ maxAliasCount: -1 }) as { install?: { device?: unknown } } | null;
  if (install?.install && !install.install.device) {
    const n = lines.findIndex((l) => /^install:/.test(l));
    out.push({ line: n + 1, message: "install.device is required: a disk such as /dev/sda, or auto." });
  }
  return out;
}

export const Lint: Story = {
  args: {
    lint: lintCloudConfig,
    defaultValue: `hostname: edge-store-0142
users:
  - name: kairos
    passwd: "kairos
install:
  reboot: true`,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`lint` takes the text and returns diagnostics by line (and column) or by offset; it may be async. It runs once typing pauses (`lintDelay`, 300 ms). Errors are underlined in the recovery red and warnings in amber, with a mark in the gutter; hover a mark for the message. The lint code is loaded the first time an editor has `lint`, so editors without it do not pay for it. This story parses with the `yaml` package and checks two cloud-config rules.",
      },
    },
  },
};

export const InField: Story = {
  name: "In a Field",
  parameters: {
    docs: {
      description: {
        story:
          "Inside Field the editor takes the id, description and invalid state like any control. A `<label for>` cannot name a contenteditable, so the editor finds its label and points `aria-labelledby` at it, and clicking the label focuses the editor.",
      },
    },
  },
  render: function Render() {
    const [value, setValue] = React.useState(
      "#cloud-config\nhostname: edge-store-0142\ninstall:\n  reboot: true",
    );
    const missing = !/^\s+device:/m.test(value);
    return (
      <Field
        id="review-config"
        label="Cloud config"
        help="Applied on first boot."
        error={missing ? "install.device is required." : undefined}
        required
      >
        <CodeEditor value={value} onChange={setValue} minHeight={180} />
      </Field>
    );
  },
};

export const OnTheFormSurface: Story = {
  name: "On the form surface",
  parameters: {
    docs: {
      description: {
        story:
          '`variant="surface"` draws the editor on the page\'s own form surface instead of the code ground, for a config edited inside a form rather than shown as a terminal. It follows the theme, so switch the toolbar to dark and it follows. The syntax colours change with it: the code palette is built for a dark ground and `--code-key` is 2.05:1 on white, so this ground uses `--link` for keys, `--ok` for literals and `--muted` for comments, which pass AA on both. Toggle the theme to compare.',
      },
    },
  },
  render: function OnSurface() {
    const [value, setValue] = React.useState(cloudConfig);
    return (
      <div className="max-w-2xl">
        <CodeEditor aria-label="Cloud config" variant="surface" value={value} onChange={setValue} />
      </div>
    );
  },
};
