import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useMemo, useState } from "react";
import tokensCss from "../../styles/tokens.css?raw";
import componentsCss from "../../styles/components.css?raw";
import { logos } from "../Logo/logos.generated.ts";

// The vanilla layer is for pages with no build step, so the story renders a
// real one: an iframe whose document links nothing and bundles nothing, just
// tokens.css and components.css inline. The frame follows the Storybook
// theme by copying the `dark` class onto its own <html>.

function useStorybookTheme(): "light" | "dark" {
  const read = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");
  const [theme, setTheme] = useState<"light" | "dark">(read);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

function page(body: string, theme: "light" | "dark"): string {
  return `<!DOCTYPE html>
<html lang="en" class="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vanilla CSS sample</title>
<style>${tokensCss}</style>
<style>${componentsCss}</style>
</head>
<body>${body}</body>
</html>`;
}

// The mark, built from the same generated artwork data the Logo component uses.
const mark = logos["icon-color"];
const svgMark = `<svg viewBox="${mark.viewBox}" aria-hidden="true" focusable="false" style="height:28px;width:auto">${mark.shapes
  .map(
    (s) =>
      `<${s.tag} ${Object.entries(s.attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ")}/>`,
  )
  .join("")}</svg>`;

const sample = `
<div class="page">
  <header class="topbar">
    <a class="brand" href="#">${svgMark}<span>Web Installer</span></a>
    <div class="topbar-actions">
      <div class="theme-toggle" role="group" aria-label="Theme">
        <button type="button" aria-label="System theme" aria-pressed="false">A</button>
        <button type="button" aria-label="Light theme" aria-pressed="true">L</button>
        <button type="button" aria-label="Dark theme" aria-pressed="false">D</button>
      </div>
    </div>
  </header>
  <main class="container">
    <header class="page-header">
      <div>
        <p class="eyebrow">Step 3 of 5</p>
        <div class="title-row">
          <h1>Installation progress</h1>
          <div class="status connected">Connected</div>
        </div>
        <p class="description">The framework-free layer: the same tokens and classes the web installer ships, with no build step.</p>
      </div>
      <div class="page-actions">
        <button class="btn outline">Download logs</button>
        <button class="btn">Install</button>
      </div>
    </header>

    <section class="card form-card">
      <h2 class="card-title">Buttons</h2>
      <div class="row">
        <button class="btn">Primary</button>
        <button class="btn outline">Outline</button>
        <button class="btn secondary">Secondary</button>
        <button class="btn ghost">Ghost</button>
        <button class="btn destructive">Destructive</button>
        <button class="btn destructive-outline">Destructive outline</button>
        <button class="btn sm">Small</button>
        <button class="btn lg">Large</button>
        <button class="btn" disabled>Disabled</button>
      </div>
    </section>

    <section class="card form-card">
      <h2 class="card-title">A field, badges and chips</h2>
      <div class="field">
        <label for="device">Target device</label>
        <input type="text" id="device" value="/dev/nvme0n1" aria-describedby="device-help">
        <p class="fhelp" id="device-help">The whole disk is formatted.</p>
      </div>
      <div class="field">
        <label for="flavor">Flavor</label>
        <select id="flavor"><option>ubuntu-24.04</option><option>fedora-40</option><option>alpine-3.21</option></select>
      </div>
      <label class="checkbox-group" for="reboot"><input type="checkbox" id="reboot" checked> Reboot when done</label>
      <div class="row">
        <span class="badge">Default</span>
        <span class="badge tone-success">online</span>
        <span class="badge tone-warning">pending</span>
        <span class="badge tone-danger">failed</span>
        <span class="badge tone-info">building</span>
        <span class="badge tone-neutral">unknown</span>
        <span class="pill live">live</span>
      </div>
      <div class="chips">
        <span class="chip"><span>env=prod</span><button type="button" aria-label="Remove env=prod">×</button></span>
        <span class="chip"><span>region=eu-west</span><button type="button" aria-label="Remove region=eu-west">×</button></span>
      </div>
    </section>

    <div class="banner">The disk will be wiped. Back up anything you need first.</div>
    <div class="banner ok">Configuration saved.</div>
    <div class="banner" role="alert">The node could not reach the registry.</div>
    <div class="alert alert-info">This is an informational alert.</div>

    <section class="card">
      <ul class="steps">
        <li class="done"><span class="marker">✓</span><span>Partitioning disk</span></li>
        <li class="done"><span class="marker">✓</span><span>Installing active system</span></li>
        <li class="active"><span class="marker">▶</span><span>Configuring bootloader</span></li>
        <li><span class="marker">○</span><span>Creating recovery image</span></li>
        <li class="failed"><span class="marker">✗</span><span>Running after-install</span></li>
      </ul>
    </section>

    <div class="output-box" role="log" aria-label="Installation log"><pre>INFO  Partitioning /dev/nvme0n1
INFO  Writing active image quay.io/kairos/ubuntu:24.04-core-amd64-generic-v3.5.0
<span class="error">ERROR after-install hook exited with status 1</span></pre></div>
  </main>
  <footer class="footer"><a href="#">GitHub</a><a href="#">Documentation</a><p>Copyright Kairos authors 2022-2026</p></footer>
</div>`;

const wizard = `
<div class="shell">
  <header class="topbar">
    <a class="brand" href="#">${svgMark}<span>Web Installer</span></a>
    <div class="topbar-actions"><button class="btn icon-btn on-navy" aria-label="Show the steps">☰</button></div>
  </header>
  <aside class="sidebar">
    <div class="sidebar-head">${svgMark.replace("height:28px", "height:44px")}<span class="product">Web Installer</span></div>
    <div class="divider"></div>
    <nav class="rail" aria-label="Installation steps">
      <span class="rail-label">Steps</span>
      <button type="button"><span class="marker done" aria-hidden="true">✓</span><span class="step-title">Target device</span></button>
      <button type="button"><span class="marker done" aria-hidden="true">✓</span><span class="step-title">Users and SSH keys</span></button>
      <button type="button" aria-current="step"><span class="marker" aria-hidden="true">3</span><span class="step-title">Network</span></button>
      <button type="button" disabled><span class="marker" aria-hidden="true">4</span><span class="step-title">Kubernetes</span></button>
      <button type="button" disabled><span class="marker" aria-hidden="true">5</span><span class="step-title">Review and install</span></button>
    </nav>
    <div class="divider"></div>
    <div class="sidebar-foot">
      <div class="theme-toggle" role="group" aria-label="Theme">
        <button type="button" aria-label="System theme" aria-pressed="true">A</button>
        <button type="button" aria-label="Light theme" aria-pressed="false">L</button>
        <button type="button" aria-label="Dark theme" aria-pressed="false">D</button>
      </div>
    </div>
  </aside>
  <div class="content">
    <main class="main">
      <header class="page-header"><div><div class="title-row"><h1>Network</h1></div><p class="description">How this node reaches the registry and the rest of the cluster.</p></div></header>
      <section class="card form-card">
        <div class="field"><label for="host">Hostname</label><input type="text" id="host" placeholder="node-01"></div>
        <div class="choices">
          <label class="choice sel"><input type="radio" name="net" checked><span><span class="cl">dhcp</span><br><span class="cd">Ask the network for an address.</span></span></label>
          <label class="choice"><input type="radio" name="net"><span><span class="cl">static</span><br><span class="cd">Set the address, gateway and DNS by hand.</span></span></label>
        </div>
      </section>
      <div class="actions"><button class="btn outline">Back</button><button class="btn">Next</button></div>
    </main>
  </div>
</div>`;

function Frame({ body, height = 900 }: { body: string; height?: number }) {
  const theme = useStorybookTheme();
  const srcDoc = useMemo(() => page(body, theme), [body, theme]);
  return (
    <iframe
      title="Vanilla CSS sample"
      srcDoc={srcDoc}
      style={{ width: "100%", height, border: 0, display: "block" }}
    />
  );
}

const meta = {
  title: "Patterns/Vanilla CSS",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`@kairos-io/design/components.css` is the framework-free layer: the web installer's stylesheet with every value replaced by a token, and its class names kept (`.btn`, `.card`, `.badge.tone-success`, `.steps`, `.output-box`, the `.shell` with its `.sidebar` and `.rail`). A page links `tokens.css` and `components.css` and needs no build and no network. These samples are real pages in an iframe; they follow the Storybook theme.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Components: Story = {
  render: () => <Frame body={sample} height={1180} />,
};

export const WizardShellVanilla: Story = {
  name: "Wizard shell",
  render: () => <Frame body={wizard} height={640} />,
};
