import type { Meta, StoryObj } from "@storybook/react-vite";
import { VanillaFrame, diamond, markSvg } from "../../components/Vanilla/frame.tsx";

// The Kairos Installer, the on-node install UI at :8080, as the deck
// "Kairos Installer.dc.html" draws it: four steps (Device, Configure, Disk,
// Install) in a rail beside the content, built from components.css alone,
// because the installer ships inside the ISO with no build step and no
// network. Each story is one step, as a real page in an iframe.

const STEPS = [
  { t: "Device", d: "Hardware checks", h: "This machine is ready", sub: "Kairos checked the hardware this live image booted on.", cta: "Continue" },
  { t: "Configure", d: "Cloud-config", h: "Configure the node", sub: "Applied on first boot. Paste YAML or fill the essentials.", cta: "Continue to disk" },
  { t: "Disk", d: "Target and layout", h: "Choose the target disk", sub: "Kairos creates an A/B layout with a recovery partition.", cta: "Install Kairos" },
  { t: "Install", d: "Write and reboot", h: "Installing", sub: "The machine reboots into Hadron when this finishes.", cta: "Reboot now" },
];

const DEVICE = [
  ["CPU", "8 × x86_64"],
  ["Memory", "16 GiB"],
  ["TPM", "2.0"],
  ["Boot", "UEFI · SB on"],
  ["Network", "eth0 · DHCP"],
];

function shell(step: number, body: string, extra = ""): string {
  const cur = STEPS[step];
  const rail = STEPS.map((s, i) => {
    const state = i < step ? ' class="done"' : i === step ? ' aria-current="step"' : "";
    const n = i < step ? "✓" : `0${i + 1}`;
    return `<button type="button"${state}><span class="marker">${n}</span><span><span class="step-title">${s.t}</span><span class="step-desc">${s.d}</span></span></button>`;
  }).join("");
  const kv = DEVICE.map(([k, v]) => `<div class="kv"><span>${k}</span><span>${v}</span></div>`).join("");
  return `
<div class="shell">
  <header class="topbar">
    <a class="brand" href="#">${markSvg()}<span>Kairos <b>Installer</b></span></a>
    <div class="meta">
      <span class="tag surface">192.168.1.42:8080</span>
      <span class="tag surface">hadron v0.5.1 · k3s 1.36</span>
      <span class="tag surface">${diamond("status-healthy", 9)} live media</span>
      <button class="btn icon-sm on-navy menu" aria-label="Show the steps">☰</button>
    </div>
  </header>
  <div class="shell-body">
    <aside class="sidebar">
      <nav class="rail" aria-label="Installation steps">${rail}</nav>
      <div class="sidebar-foot"><span class="rail-label">This machine</span>${kv}</div>
    </aside>
    <div class="content">
      <main class="main">
        <header class="page-header">
          <div><p class="eyebrow">Step ${step + 1} of 4</p><h1>${cur.h}</h1><p class="description">${cur.sub}</p></div>
          ${extra}
        </header>
        ${body}
        <div class="actions"><button class="btn outline">Back</button><button class="btn lg">${cur.cta}</button></div>
      </main>
    </div>
  </div>
</div>`;
}

const device = shell(
  0,
  `<div class="grid">
    ${[
      ["UEFI boot", "secure boot enabled"],
      ["TPM 2.0", "available for encryption"],
      ["Network", "eth0 · 192.168.1.42"],
      ["Disk", "2 candidates found"],
    ]
      .map(
        ([t, v]) =>
          `<div class="card"><div class="card-title">${diamond("status-healthy")}${t}</div><div class="cd mono" style="margin-top:8px;font-size:12px;color:var(--sub)">${v}</div></div>`,
      )
      .join("")}
  </div>`,
);

const modes = (yaml: boolean) =>
  `<div class="segmented" aria-label="Editor"><button type="button" aria-pressed="${yaml}">YAML</button><button type="button" aria-pressed="${!yaml}">Form</button></div>`;

const configureYaml = shell(
  1,
  `<div class="code editor">
    <div class="gutter">1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10</div>
    <div class="lines"><span class="comment">#cloud-config</span>
<span class="key">hostname</span>: edge-store-0142
<span class="key">users</span>:
  - <span class="key">name</span>: kairos
    <span class="key">ssh_authorized_keys</span>:
      - github:mauromorales
<span class="key">k3s</span>:
  <span class="key">enabled</span>: true
<span class="key">install</span>:
  <span class="key">reboot</span>: true</div>
  </div>
  <div class="mono text-ok" style="display:flex;align-items:center;gap:8px">${diamond("status-healthy", 10)} valid cloud-config · 10 lines</div>`,
  modes(true),
);

const configureForm = shell(
  1,
  `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">
    ${[
      ["Hostname", "edge-store-0142"],
      ["User", "kairos"],
      ["SSH keys from", "github:mauromorales"],
      ["Register with", "Kairos console · kairos.local"],
    ]
      .map(([l, v], i) => `<div class="field"><label for="f${i}">${l}</label><input type="text" id="f${i}" value="${v}"></div>`)
      .join("")}
  </div>
  <div class="row">
    <label class="checkbox-group"><input type="checkbox" class="toggle" checked> Enable k3s</label>
    <label class="checkbox-group"><input type="checkbox" class="toggle" checked> Encrypt persistent</label>
    <label class="checkbox-group"><input type="checkbox" class="toggle"> Reboot when done</label>
  </div>`,
  modes(false),
);

const disk = shell(
  2,
  `<div class="choices">
    <label class="choice"><input type="radio" name="disk" checked><span><span class="cl">NVMe · 512 GB</span><span class="cd">/dev/nvme0n1</span></span><span class="cm">2 partitions</span></label>
    <label class="choice"><input type="radio" name="disk"><span><span class="cl">SATA SSD · 256 GB</span><span class="cd">/dev/sda</span></span><span class="cm">empty</span></label>
  </div>
  <div class="field" style="max-width:none">
    <span class="flabel">Partition layout</span>
    <div class="disk-layout"><span class="efi">efi</span><span class="state">state · A/B</span><span class="recovery">recovery</span><span class="persistent">persistent</span></div>
  </div>
  <div class="banner" role="alert">Everything on <b class="mono">/dev/nvme0n1</b> will be erased.</div>`,
);

const install = shell(
  3,
  `<div class="card form-card">
    <div class="progress-head"><span>Writing image to /dev/nvme0n1</span><span class="pct">68%</span></div>
    <div class="tilebar" aria-label="68% written">${Array.from({ length: 60 }, (_, i) => `<i${i < 41 ? ' class="done"' : ""}></i>`).join("")}</div>
    <div class="log">
      <span>✓ partitioned /dev/nvme0n1</span>
      <span>✓ efi and recovery written</span>
      <span>✓ cloud-config validated</span>
      <span class="now">→ writing state A · 412 / 604 MB</span>
      <span>&nbsp;&nbsp;sealing persistent with TPM</span>
    </div>
  </div>`,
);

const meta = {
  title: "Pages/Kairos Installer",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The Kairos Installer, the on-node install UI at :8080, from the deck `Kairos Installer.dc.html`. Four steps in a rail beside the content: Device, Configure (YAML or a form), Disk and Install. Every screen is a real page in an iframe built from `tokens.css` and `components.css` alone, with `data-variant=\"installer\"` on `<html>`, because the installer ships inside the ISO with no build step and no network. Switch the toolbar theme to see both.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const H = 720;

export const Device: Story = {
  render: () => <VanillaFrame body={device} height={H} variant="installer" title="Kairos Installer · Device" />,
};

export const ConfigureYaml: Story = {
  name: "Configure · YAML",
  render: () => (
    <VanillaFrame body={configureYaml} height={H} variant="installer" title="Kairos Installer · Configure" />
  ),
};

export const ConfigureForm: Story = {
  name: "Configure · Form",
  render: () => (
    <VanillaFrame body={configureForm} height={H} variant="installer" title="Kairos Installer · Configure" />
  ),
};

export const Disk: Story = {
  render: () => <VanillaFrame body={disk} height={H} variant="installer" title="Kairos Installer · Disk" />,
};

export const Install: Story = {
  render: () => <VanillaFrame body={install} height={H} variant="installer" title="Kairos Installer · Install" />,
};
