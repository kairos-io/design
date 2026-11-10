import type { Meta, StoryObj } from "@storybook/react-vite";
import { VanillaFrame, diamond, markSvg } from "./frame.tsx";

// Every component of the framework-free layer on one page, as the Foundations
// deck lays its components section out, and the installer's shell.

const sample = `
<div class="page">
  <header class="topbar">
    <a class="brand" href="#">${markSvg()}<span>Kairos <b>Installer</b></span></a>
    <div class="meta">
      <span class="tag surface">192.168.1.42:8080</span>
      <span class="tag surface">hadron v0.5.1 · k3s 1.36</span>
      <span class="tag surface">${diamond("status-healthy", 9)} live media</span>
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
        <p class="eyebrow">Components</p>
        <div class="title-row"><h1>The framework-free layer</h1></div>
        <p class="description">The same tokens and classes the Kairos Installer ships, with no build step and no network.</p>
      </div>
      <div class="page-actions">
        <button class="btn outline">Read the docs</button>
        <button class="btn">Download ISO</button>
      </div>
    </header>

    <section class="card form-card">
      <h2 class="card-title">Buttons</h2>
      <div class="row">
        <button class="btn">Download ISO</button>
        <button class="btn secondary">Read the docs</button>
        <button class="btn outline">GitHub</button>
        <button class="btn link">Learn more →</button>
      </div>
      <div class="row">
        <button class="btn sm">Small</button>
        <button class="btn" disabled>Disabled</button>
        <button class="btn destructive">Reset node</button>
        <button class="btn destructive-outline">Wipe disk</button>
        <button class="btn ghost">Cancel</button>
        <button class="btn lg">Install Kairos</button>
      </div>
    </section>

    <section class="card form-card">
      <h2 class="card-title">Fields</h2>
      <div class="grid">
        <div class="field">
          <label for="host">Hostname</label>
          <input type="text" id="host" value="edge-store-0142" aria-describedby="host-help">
          <p class="fhelp" id="host-help">Lowercase, digits and dashes.</p>
        </div>
        <div class="field">
          <label for="disk">Target disk</label>
          <select id="disk"><option>/dev/nvme0n1</option><option>/dev/sda</option></select>
          <p class="err">Disk will be wiped.</p>
        </div>
      </div>
      <div class="row">
        <label class="checkbox-group"><input type="checkbox" class="toggle" checked> Enable k3s</label>
        <label class="checkbox-group"><input type="checkbox" class="toggle" checked> Encrypt persistent</label>
        <label class="checkbox-group"><input type="checkbox" class="toggle"> Reboot when done</label>
        <label class="checkbox-group"><input type="checkbox" checked> Register with the console</label>
      </div>
      <div class="choices">
        <label class="choice sel"><input type="radio" name="d" checked><span><span class="cl">NVMe · 512 GB</span><span class="cd">/dev/nvme0n1</span></span><span class="cm">2 partitions</span></label>
        <label class="choice"><input type="radio" name="d"><span><span class="cl">SATA SSD · 256 GB</span><span class="cd">/dev/sda</span></span><span class="cm">empty</span></label>
      </div>
    </section>

    <section class="card form-card">
      <h2 class="card-title">Status · diamond = node state</h2>
      <div class="row">
        <span class="badge tone-success">Healthy</span>
        <span class="badge tone-info">Upgrading</span>
        <span class="badge tone-danger">Recovery</span>
        <span class="badge tone-info outline">Installing</span>
        <span class="badge tone-neutral outline">Offline</span>
        <span class="badge tone-warning">Degraded</span>
      </div>
      <div class="row">
        <span class="tag">hadron v0.5.1</span>
        <span class="tag">k3s 1.36</span>
        <span class="tag outline">group: retail-eu</span>
        <span class="pill live">live</span>
        <span class="chip"><span>env=prod</span><button type="button" aria-label="Remove env=prod">×</button></span>
      </div>
      <div class="row">
        <span class="status connected">Connected</span>
        <span class="status connecting">Connecting</span>
        <span class="status completed">Completed</span>
        <span class="status disconnected">Disconnected</span>
      </div>
    </section>

    <section class="card form-card">
      <h2 class="card-title">Tabs and level picker</h2>
      <div class="segmented" role="tablist" aria-label="Level">
        <button type="button" role="tab" aria-pressed="true">YAML</button>
        <button type="button" role="tab" aria-pressed="false">Form</button>
      </div>
      <div class="grid">
        <div class="card raised"><span class="stat-label">Healthy</span><div class="stat-value">98.6%</div></div>
        <div class="card raised"><span class="stat-label">Rollout</span><div class="stat-value">33 / 40</div></div>
      </div>
      <div class="tilebar" aria-label="Rollout progress: 33 of 40">${Array.from({ length: 40 }, (_, i) => `<i${i < 33 ? ' class="done"' : ""}></i>`).join("")}</div>
    </section>

    <div class="callout"><span><b>Ready to automate?</b> Every console action maps to a <code>kairos</code> command. <a href="#">Go to L2 →</a></span></div>
    <div class="banner">The disk will be wiped. Back up anything you need first.</div>
    <div class="banner ok">Configuration saved.</div>
    <div class="banner" role="alert">The node could not reach the registry.</div>

    <section class="card">
      <ul class="steps">
        <li class="done"><span class="marker"></span><span>Partitioning disk</span></li>
        <li class="done"><span class="marker"></span><span>Installing active system</span></li>
        <li class="active"><span class="marker"></span><span>Configuring bootloader</span></li>
        <li><span class="marker"></span><span>Creating recovery image</span></li>
        <li class="failed"><span class="marker"></span><span>Running after-install</span></li>
      </ul>
    </section>

    <div class="terminal">
      <div class="terminal-head"><span>terminal</span><span>copy</span></div>
      <div class="terminal-body"><pre><span class="prompt">$</span> kairos artifacts create --iso \\
  --image quay.io/kairos/hadron:v0.5.1
<span class="muted">  building: 412 / 604 MB</span>
<span class="error">  error: registry unreachable</span></pre></div>
    </div>
  </main>
  <footer class="footer"><a href="#">GitHub</a><a href="#">Documentation</a><p>Copyright Kairos authors 2022-2026</p></footer>
</div>`;

const wizard = `
<div class="shell">
  <header class="topbar">
    <a class="brand" href="#">${markSvg()}<span>Kairos <b>Installer</b></span></a>
    <div class="meta">
      <span class="tag surface">192.168.1.42:8080</span>
      <span class="tag surface">${diamond("status-healthy", 9)} live media</span>
      <button class="btn icon-sm on-navy menu" aria-label="Show the steps">☰</button>
    </div>
  </header>
  <div class="shell-body">
    <aside class="sidebar">
      <nav class="rail" aria-label="Installation steps">
        <button type="button" class="done"><span class="marker">✓</span><span><span class="step-title">Device</span><span class="step-desc">Hardware checks</span></span></button>
        <button type="button" aria-current="step"><span class="marker">02</span><span><span class="step-title">Configure</span><span class="step-desc">Cloud-config</span></span></button>
        <button type="button"><span class="marker">03</span><span><span class="step-title">Disk</span><span class="step-desc">Target and layout</span></span></button>
        <button type="button"><span class="marker">04</span><span><span class="step-title">Install</span><span class="step-desc">Write and reboot</span></span></button>
      </nav>
      <div class="sidebar-foot">
        <span class="rail-label">This machine</span>
        <div class="kv"><span>CPU</span><span>8 × x86_64</span></div>
        <div class="kv"><span>Memory</span><span>16 GiB</span></div>
        <div class="kv"><span>TPM</span><span>2.0</span></div>
      </div>
    </aside>
    <div class="content">
      <main class="main">
        <header class="page-header"><div><p class="eyebrow">Step 2 of 4</p><h1>Configure the node</h1><p class="description">Applied on first boot. Paste YAML or fill the essentials.</p></div>
          <div class="segmented" aria-label="Editor"><button type="button" aria-pressed="false">YAML</button><button type="button" aria-pressed="true">Form</button></div></header>
        <div class="grid">
          <div class="field"><label for="h">Hostname</label><input type="text" id="h" value="edge-store-0142"></div>
          <div class="field"><label for="u">User</label><input type="text" id="u" value="kairos"></div>
        </div>
        <div class="actions"><button class="btn outline">Back</button><button class="btn lg">Continue to disk</button></div>
      </main>
    </div>
  </div>
</div>`;

const meta = {
  title: "Patterns/Vanilla CSS",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`@kairos-io/design/components.css` is the framework-free layer: the Kairos Installer's class names (`.btn`, `.card`, `.badge.tone-success`, `.tag`, `.choice`, `.steps`, `.tilebar`, `.terminal`, the `.shell` with its `.sidebar` and `.rail`) over the tokens, drawn as the Foundations and Kairos Installer decks draw them. A page links `tokens.css` and `components.css` and needs no build and no network. These samples are real pages in an iframe; they follow the Storybook theme.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Components: Story = {
  render: () => <VanillaFrame body={sample} height={1500} />,
};

export const WizardShellVanilla: Story = {
  name: "Wizard shell",
  render: () => <VanillaFrame body={wizard} height={620} variant="installer" />,
};

// The numbered terminal and textarea: CSS counters on an <ol> for the output,
// and a gutter beside a <textarea wrap="off"> that one line of script keeps
// in step with the control's scroll.
const numbered = `
<div class="page">
  <main class="container narrow">
    <header class="page-header">
      <div>
        <p class="eyebrow">Components</p>
        <div class="title-row"><h1>Line numbers</h1></div>
        <p class="description"><code>.terminal.numbered</code> counts its lines; <code>.textarea.numbered</code> wraps a control with a gutter.</p>
      </div>
    </header>

    <div class="terminal numbered" style="--gutter:2ch">
      <div class="terminal-head"><span>cloud-config.yaml</span><span>copy</span></div>
      <div class="terminal-body"><ol><li><span class="muted">#cloud-config</span></li><li class="hl">hostname: edge-store-0142</li><li class="current">users:</li><li>  - name: kairos</li><li>    ssh_authorized_keys:</li><li>      - ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl operator@edge-store-0142.fleet.example.internal</li><li>k3s:</li><li>  enabled: true</li><li>install:</li><li>  reboot: true</li></ol></div>
    </div>

    <div class="terminal numbered" style="--gutter:3ch">
      <div class="terminal-head"><span>upgrade.log · from line 118</span></div>
      <div class="terminal-body"><ol style="--first-line:118"><li><span class="prompt">$</span> kairos upgrade --source oci:quay.io/kairos/hadron:v0.5.2</li><li>INFO Pulling quay.io/kairos/hadron:v0.5.2</li><li class="error">[ERROR] bootloader: efibootmgr: EFI variables are not supported on this system</li></ol></div>
    </div>

    <div class="field">
      <label for="cc">Cloud config</label>
      <div class="textarea numbered" style="--gutter:2ch">
        <div class="band error" style="top:${10 + 4 * 13 * 1.85}px"></div>
        <div class="gutter" aria-hidden="true"><div>1<br>2<br>3<br>4<br><span class="error">5</span><br>6<br>7<br>8<br>9<br>10</div></div>
        <textarea id="cc" wrap="off" rows="6" aria-describedby="cc-err" aria-invalid="true">#cloud-config
hostname: edge-store-0142
users:
  - name: kairos
    ssh_authorized_keys:
      - ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl operator@edge-store-0142.fleet.example.internal
k3s:
  enabled: true
install:
  reboot: true</textarea>
      </div>
      <p id="cc-err" class="err">Line 5: a mapping value is not allowed here.</p>
    </div>
  </main>
</div>
<script>
  const area = document.getElementById("cc");
  const gutter = area.previousElementSibling.firstElementChild;
  const sync = () => { gutter.style.height = area.clientHeight + "px"; gutter.firstElementChild.style.transform = "translateY(-" + area.scrollTop + "px)"; };
  area.addEventListener("scroll", sync);
  sync();
</script>`;

export const NumberedVanilla: Story = {
  name: "Line numbers",
  render: () => <VanillaFrame body={numbered} height={1000} />,
};
