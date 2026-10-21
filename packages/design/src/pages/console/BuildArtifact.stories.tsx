import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Badge } from "../../components/Badge/Badge.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { Checkbox } from "../../components/Checkbox/Checkbox.tsx";
import { ChoiceCard, ChoiceGroup } from "../../components/ChoiceCard/ChoiceCard.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { FilterChip } from "../../components/FilterChip/FilterChip.tsx";
import { Input } from "../../components/Input/Input.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl.tsx";
import { StatusDot } from "../../components/StatusDot/StatusDot.tsx";
import { WizardSteps } from "../../components/Steps/WizardSteps.tsx";
import { Switch } from "../../components/Switch/Switch.tsx";
import { Terminal } from "../../components/Terminal/Terminal.tsx";
import { Tile } from "../../components/Tiles/Tile.tsx";
import { tilePoints } from "../../lib/tiles.ts";
import { ConsoleShell, Panel } from "./ConsoleShell.tsx";

const meta = {
  title: "Pages/Kairos console/Build artifact",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'Factory › Artifacts › New build, from `Kairos Console - Build Artifact.dc.html`: the six-step wizard (Base, System, Extensions, Access, Output, Review) with the live build summary beside it and the equivalent CLI at the end. Built from AppShell and Sidebar, PageHeader, WizardSteps, ChoiceCard and ChoiceGroup, FilterChip, Field and Input, Checkbox, Badge, SegmentedControl, Switch, Tile, Terminal and Button, in `data-variant="console"`. Every pick changes the summary and the command.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const STEPS = [
  { id: "base", label: "Base" },
  { id: "system", label: "System" },
  { id: "extensions", label: "Extensions" },
  { id: "access", label: "Access" },
  { id: "output", label: "Output" },
  { id: "review", label: "Review" },
];
const BASES: [string, string][] = [
  ["Hadron", "quay.io/kairos/hadron:v0.5.1"],
  ["Ubuntu 24.04", "ubuntu:24.04"],
  ["Fedora 42", "fedora:42"],
  ["Alpine 3.22", "alpine:3.22"],
  ["Rocky 9", "rockylinux:9"],
];
const SOURCES: [string, string][] = [
  ["Kairos base", "Start from a published base image"],
  ["Dockerfile", "Paste a Dockerfile with Kairos Factory"],
  ["Existing artifact", "Rebuild from an earlier artifact"],
];
const ARCH: [string, string][] = [
  ["AMD64", "Intel and AMD x86_64"],
  ["ARM64", "Ampere, Graviton, Raspberry Pi, Orin"],
];
const MODELS = ["Generic", "Raspberry Pi 3", "Raspberry Pi 4", "Nvidia AGX Orin", "Nvidia Orin NX"];
const VARIANTS: [string, string][] = [
  ["Core", "Immutable OS only"],
  ["Standard", "With Kubernetes"],
];
const K8S = ["k3s", "k0s"];
const EXT: [string, string, string, string][] = [
  ["tailscale", "1.84.0", "Mesh VPN for remote access", "sysext"],
  ["nvidia", "570.86", "GPU drivers and container toolkit", "sysext"],
  ["store-pos-config", "2026.10", "Point-of-sale configuration", "confext"],
  ["falco", "0.41.0", "Runtime security monitoring", "sysext"],
];
const OUT: { title: string; items: [string, string, string][] }[] = [
  {
    title: "Install media",
    items: [
      ["iso", "ISO", "Bootable installer image"],
      ["netboot", "Netboot", "PXE network boot artifacts"],
      ["uki", "UKI", "Signed unified kernel image"],
    ],
  },
  {
    title: "Disk images",
    items: [
      ["rawDisk", "Raw disk", "Flat .raw disk image"],
      ["cloudImage", "Cloud image", "Generic cloud disk"],
      ["gce", "Google Cloud", "GCE-compatible image"],
      ["vhd", "Azure (VHD)", "Azure VHD image"],
      ["maas", "MAAS", "MAAS-deployable image"],
    ],
  },
  { title: "Archives", items: [["tar", "TAR", "OCI container tarball"]] },
];
const PRESETS: [string, string][] = [
  ["Safe", "Upgrade, reboot, unregister"],
  ["Full", "Adds exec, reset, cloud-config"],
  ["Custom", "Pick each command"],
];

const userOptions: { value: "default" | "custom" | "none"; label: string }[] = [
  { value: "default", label: "Default user" },
  { value: "custom", label: "Custom user" },
  { value: "none", label: "No user" },
];

interface Build {
  step: string;
  src: number;
  base: number;
  arch: number;
  model: number;
  variant: number;
  k8s: number;
  ext: Record<string, boolean>;
  autoInstall: boolean;
  register: boolean;
  preset: "Safe" | "Full" | "Custom";
  user: "default" | "custom" | "none";
  fips: boolean;
  trusted: boolean;
  insecure: boolean;
  out: Record<string, boolean>;
}

const initial: Build = {
  step: "base",
  src: 0,
  base: 0,
  arch: 0,
  model: 0,
  variant: 1,
  k8s: 0,
  ext: { tailscale: true, nvidia: false, "store-pos-config": true, falco: false },
  autoInstall: true,
  register: true,
  preset: "Safe",
  user: "custom",
  fips: false,
  trusted: true,
  insecure: false,
  out: {
    iso: true,
    uki: true,
    netboot: false,
    rawDisk: false,
    cloudImage: false,
    gce: false,
    vhd: false,
    maas: false,
    tar: false,
  },
};

type Row = { k: string; v: string; mono?: boolean; warn?: string };
function summaryOf(b: Build): { title: string; step: string; rows: Row[] }[] {
  const outLabels = OUT.flatMap((g) => g.items)
    .filter(([k]) => b.out[k])
    .map(([, l]) => l);
  return [
    {
      title: "Base",
      step: "base",
      rows: [
        { k: "Name", v: "retail-eu-hadron" },
        { k: "Image", v: BASES[b.base][1], mono: true },
      ],
    },
    {
      title: "System",
      step: "system",
      rows: [
        { k: "Architecture", v: ARCH[b.arch][0] },
        { k: "Model", v: MODELS[b.model] },
        { k: "Variant", v: VARIANTS[b.variant][0] },
        { k: "Kubernetes", v: b.variant ? `${K8S[b.k8s]} v1.36.4` : "None" },
        { k: "Version", v: "Kairos v4.3.0" },
      ],
    },
    {
      title: "Extensions",
      step: "extensions",
      rows: [
        {
          k: "Bake in",
          v:
            EXT.filter(([n]) => b.ext[n])
              .map(([n]) => n)
              .join(", ") || "None",
        },
      ],
    },
    {
      title: "Access",
      step: "access",
      rows: [
        {
          k: "User",
          v:
            b.user === "custom"
              ? "Custom user · ops"
              : b.user === "default"
                ? "Default user · kairos"
                : "No user",
        },
        { k: "SSH keys", v: "2 SSH keys" },
        { k: "Install", v: b.autoInstall ? "Auto-install on first boot" : "Manual install" },
        { k: "Register", v: b.register ? "Yes · retail-eu" : "No" },
        {
          k: "Commands",
          v: b.preset,
          warn: b.preset === "Full" ? "destructive commands allowed" : undefined,
        },
      ],
    },
    { title: "Output", step: "output", rows: [{ k: "Formats", v: outLabels.join(", ") || "None" }] },
    {
      title: "Security",
      step: "access",
      rows: [
        { k: "FIPS", v: b.fips ? "Yes" : "No" },
        { k: "Trusted boot", v: b.trusted ? "Yes" : "No" },
        {
          k: "Insecure registries",
          v: b.insecure ? "Yes" : "No",
          warn: b.insecure ? "insecure registries allowed" : undefined,
        },
      ],
    },
  ];
}

function cliOf(b: Build): string[] {
  const flags = Object.entries(b.out)
    .filter(([, v]) => v)
    .map(([k]) => "--" + k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()));
  return [
    "kairos artifacts create \\",
    `  --image ${BASES[b.base][1]} \\`,
    `  --arch ${ARCH[b.arch][0].toLowerCase()} --model ${MODELS[b.model].toLowerCase().replace(/ /g, "-")} \\`,
    `  --variant ${VARIANTS[b.variant][0].toLowerCase()}${b.variant ? " --k8s " + K8S[b.k8s] : ""} \\`,
    `  ${flags.join(" ")}${b.trusted ? " --trusted-boot" : ""}${b.fips ? " --fips" : ""}`,
  ];
}

function Summary({
  build,
  onEdit,
  compact,
}: {
  build: Build;
  onEdit: (step: string) => void;
  compact?: boolean;
}) {
  return (
    <>
      {summaryOf(build).map((s) => (
        <div key={s.title} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs text-muted">{s.title}</span>
            <Button
              variant="link"
              className={`h-auto p-0 font-bold ${compact ? "text-xs" : "text-[13px]"}`}
              onClick={() => onEdit(s.step)}
            >
              Edit
            </Button>
          </div>
          {s.rows.map((r) => (
            <div
              key={r.k}
              className={`grid gap-2 ${compact ? "grid-cols-[100px_1fr] text-[13px]" : "grid-cols-[120px_1fr] py-[3px] text-sm"}`}
            >
              <span className="text-muted">{r.k}</span>
              <span className="flex flex-col gap-0.5">
                <span className={`wrap-anywhere ${r.mono ? "font-mono text-xs" : ""}`}>{r.v}</span>
                {r.warn && !compact && (
                  <span className="flex items-center gap-1.5 text-xs text-status-warning">
                    <StatusDot size={8} tone="warning" />
                    {r.warn}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function BuildArtifactPage() {
  const [b, setB] = useState<Build>(initial);
  const set = (patch: Partial<Build>) => setB((prev) => ({ ...prev, ...patch }));
  const at = STEPS.findIndex((s) => s.id === b.step);
  const go = (i: number) => set({ step: STEPS[Math.max(0, Math.min(STEPS.length - 1, i))].id });
  const outCount = Object.values(b.out).filter(Boolean).length;
  return (
    <ConsoleShell active="Artifacts">
      <div className="flex flex-col">
        <header className="flex flex-col gap-[18px] px-7 pt-5">
          <PageHeader
            title="Build an artifact"
            className="mb-0"
            breadcrumb={[{ label: "Factory", href: "#" }, { label: "Artifacts" }, { label: "New build" }]}
          >
            <span className="text-sm text-muted">
              Factory kairosifies the base with kairos-init, then builds the outputs.{" "}
              <Button variant="link" className="h-auto p-0 text-sm font-bold" onClick={() => go(5)}>
                Copy as CLI
              </Button>
            </span>
          </PageHeader>
          <WizardSteps
            steps={STEPS}
            current={b.step}
            onStepChange={(id) => set({ step: id })}
            label="Build steps"
          />
        </header>

        <div className="flex flex-wrap items-start gap-5 px-7 pt-3 pb-8">
          <main className="flex min-w-[320px] flex-1 flex-col gap-3.5 lg:min-w-[480px]">
            {b.step === "base" && (
              <Panel title="Image source" className="gap-4 p-[22px]">
                <ChoiceGroup
                  aria-label="Image source"
                  className="sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
                >
                  {SOURCES.map(([l, d], i) => (
                    <ChoiceCard
                      key={l}
                      diamond
                      title={l}
                      description={d}
                      selected={b.src === i}
                      onSelect={() => set({ src: i })}
                    />
                  ))}
                </ChoiceGroup>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="build-name" label="Name">
                    <Input mono defaultValue="retail-eu-hadron" />
                  </Field>
                  <Field id="build-image" label="Base image">
                    <Input mono value={BASES[b.base][1]} readOnly />
                  </Field>
                </div>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Base">
                  {BASES.map(([l], i) => (
                    <FilterChip key={l} selected={b.base === i} onSelect={() => set({ base: i })}>
                      {l}
                    </FilterChip>
                  ))}
                </div>
              </Panel>
            )}

            {b.step === "system" && (
              <>
                <Panel title="Architecture" className="p-[22px]">
                  <ChoiceGroup aria-label="Architecture">
                    {ARCH.map(([l, d], i) => (
                      <ChoiceCard
                        key={l}
                        title={l}
                        description={d}
                        selected={b.arch === i}
                        onSelect={() => set({ arch: i })}
                        className="[&>span:first-child]:text-[17px]"
                      />
                    ))}
                  </ChoiceGroup>
                </Panel>
                <Panel title="Model" className="p-[22px]">
                  <ChoiceGroup
                    aria-label="Model"
                    className="sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]"
                  >
                    {MODELS.map((l, i) => (
                      <ChoiceCard
                        key={l}
                        title={l}
                        selected={b.model === i}
                        onSelect={() => set({ model: i })}
                        className="p-3 [&>span:first-child]:text-[15px]"
                      />
                    ))}
                  </ChoiceGroup>
                </Panel>
                <Panel title="Variant and Kubernetes" className="p-[22px]">
                  <ChoiceGroup aria-label="Variant">
                    {VARIANTS.map(([l, d], i) => (
                      <ChoiceCard
                        key={l}
                        title={l}
                        description={d}
                        selected={b.variant === i}
                        onSelect={() => set({ variant: i })}
                        className="[&>span:first-child]:text-[17px]"
                      />
                    ))}
                  </ChoiceGroup>
                  {b.variant === 1 && (
                    <div
                      className="flex flex-wrap items-center gap-1.5"
                      role="group"
                      aria-label="Kubernetes distribution"
                    >
                      {K8S.map((l, i) => (
                        <FilterChip key={l} selected={b.k8s === i} onSelect={() => set({ k8s: i })}>
                          {l}
                        </FilterChip>
                      ))}
                      <span className="px-1 font-mono text-xs text-muted">v1.36.4</span>
                    </div>
                  )}
                </Panel>
              </>
            )}

            {b.step === "extensions" && (
              <Panel title="Extensions" className="gap-3 p-[22px]">
                <span className="text-[15px] text-sub">
                  Bake into the image, or install after first boot.
                </span>
                {EXT.map(([name, v, d, type]) => (
                  <div
                    key={name}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-base bg-inner p-3"
                  >
                    <Checkbox
                      checked={b.ext[name]}
                      onChange={() => set({ ext: { ...b.ext, [name]: !b.ext[name] } })}
                      label={
                        <span className="text-[15px] font-bold">
                          {name} <span className="font-mono text-xs font-normal text-muted">{v}</span>
                        </span>
                      }
                      description={d}
                    />
                    <Badge>{type}</Badge>
                  </div>
                ))}
              </Panel>
            )}

            {b.step === "access" && (
              <>
                <Panel title="Access" className="p-[22px]">
                  <SegmentedControl<Build["user"]>
                    aria-label="User"
                    value={b.user}
                    onChange={(user) => set({ user })}
                    options={userOptions}
                    fill={false}
                    className="w-max"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field id="build-user" label="Username">
                      <Input mono defaultValue="ops" disabled={b.user !== "custom"} />
                    </Field>
                    <Field id="build-keys" label="SSH keys">
                      <Input mono defaultValue="2 keys · github:retail-ops" />
                    </Field>
                  </div>
                </Panel>
                <Panel title="Provisioning" className="p-[22px]">
                  <Switch
                    checked={b.autoInstall}
                    onCheckedChange={(v) => set({ autoInstall: v })}
                    label="Auto-install on first boot"
                    description="No keyboard needed"
                  />
                  <Switch
                    checked={b.register}
                    onCheckedChange={(v) => set({ register: v })}
                    label="Register with Fleet"
                    description="Joins group retail-eu"
                  />
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold">Allowed commands</span>
                    <SegmentedControl<Build["preset"]>
                      aria-label="Allowed commands"
                      value={b.preset}
                      onChange={(preset) => set({ preset })}
                      options={PRESETS.map(([value, hint]) => ({
                        value: value as Build["preset"],
                        label: value,
                        hint,
                      }))}
                      fill
                    />
                  </div>
                </Panel>
                <Panel title="Security" className="gap-3 p-[22px]">
                  <Switch
                    checked={b.trusted}
                    onCheckedChange={(v) => set({ trusted: v })}
                    label="Trusted boot"
                    description="Signed UKI, TPM-sealed encryption"
                  />
                  <Switch
                    checked={b.fips}
                    onCheckedChange={(v) => set({ fips: v })}
                    label="FIPS"
                    description="FIPS 140 crypto modules"
                  />
                  <Switch
                    checked={b.insecure}
                    onCheckedChange={(v) => set({ insecure: v })}
                    label="Allow insecure registries"
                    description="Not recommended"
                  />
                </Panel>
              </>
            )}

            {b.step === "output" &&
              OUT.map((g) => (
                <Panel key={g.title} title={g.title} className="gap-3 p-[22px]">
                  <ChoiceGroup
                    multiple
                    aria-label={g.title}
                    className="sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]"
                  >
                    {g.items.map(([k, l, d]) => (
                      <ChoiceCard
                        key={k}
                        multiple
                        title={l}
                        description={d}
                        selected={b.out[k]}
                        onSelect={() => set({ out: { ...b.out, [k]: !b.out[k] } })}
                        className="px-3.5 py-3"
                        meta={
                          b.out[k] ? (
                            <Tile size={20} tone={2} />
                          ) : (
                            <svg
                              width={20}
                              height={13}
                              viewBox="0 0 22 14"
                              aria-hidden="true"
                              className="shrink-0"
                            >
                              <polygon
                                points={tilePoints}
                                className="fill-none stroke-muted"
                                strokeWidth={1.5}
                              />
                            </svg>
                          )
                        }
                      />
                    ))}
                  </ChoiceGroup>
                </Panel>
              ))}

            {b.step === "review" && (
              <>
                <Panel
                  title="Review"
                  actions={<span className="font-mono text-xs text-muted">≈ 9 min · {outCount} outputs</span>}
                  className="p-[22px]"
                >
                  <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                    <Summary build={b} onEdit={(step) => set({ step })} />
                  </div>
                </Panel>
                <Terminal
                  title="Equivalent CLI"
                  copy
                  lines={cliOf(b)}
                  aria-label="Equivalent CLI"
                  autoscroll={false}
                />
              </>
            )}

            <div className="flex justify-between gap-3 pt-1.5">
              <Button variant="outline" size="lg" onClick={() => go(at - 1)} disabled={at === 0}>
                Back
              </Button>
              <Button size="lg" onClick={() => go(at + 1)}>
                {at === 5 ? "Start build" : at === 4 ? "Review" : `Next: ${STEPS[at + 1].label}`}
              </Button>
            </div>
          </main>

          {at < 5 && (
            <aside className="sticky top-4 flex w-full flex-col gap-3.5 rounded-base bg-surface p-[18px] lg:w-[320px]">
              <span className="text-base font-bold">Build summary</span>
              <Summary build={b} onEdit={(step) => set({ step })} compact />
            </aside>
          )}
        </div>
      </div>
    </ConsoleShell>
  );
}

export const BuildArtifact: Story = {
  name: "Build artifact",
  render: () => <BuildArtifactPage />,
};
