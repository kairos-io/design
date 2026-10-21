import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AnnouncementBar } from "../../components/AnnouncementBar/AnnouncementBar.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { FeatureCell, FeatureGrid } from "../../components/FeatureGrid/FeatureGrid.tsx";
import { Hero } from "../../components/Hero/Hero.tsx";
import { KairosMark } from "../../components/Logo/Logo.tsx";
import { SiteFooter } from "../../components/SiteFooter/SiteFooter.tsx";
import { SiteHeader } from "../../components/SiteHeader/SiteHeader.tsx";
import { SectionHeading, SiteSection } from "../../components/SiteSection/SiteSection.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/Table/Table.tsx";
import { Tile } from "../../components/Tiles/Tile.tsx";
import { TileField } from "../../components/Tiles/TileField.tsx";
import { KairosLogo } from "../../components/Logo/Logo.tsx";
import { ThemedHadronLogo, ThemedKairosLogo, kairosHome } from "./fixtures.tsx";

/** The architecture choice in the hero: two radio cards. The installer's choice cards, once they land, replace this. */
function ArchPicker({ value, onChange }: { value: number; onChange(i: number): void }) {
  return (
    <div role="radiogroup" aria-label="Architecture" className="flex flex-wrap gap-2">
      {kairosHome.archs.map((a, i) => {
        const on = i === value;
        return (
          <button
            key={a.name}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(i)}
            className={
              "flex min-w-[150px] flex-col items-start gap-0.5 rounded-base border-[1.5px] px-4 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 " +
              (on ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:border-ink")
            }
          >
            <span className="text-base font-bold">{a.name}</span>
            <span className="text-[13px]">{a.sub}</span>
          </button>
        );
      })}
    </div>
  );
}

function Homepage() {
  const [arch, setArch] = useState(0);
  const h = kairosHome;
  return (
    <div className="min-h-screen bg-bg text-ink">
      <AnnouncementBar tag="v4.3.0" action={<a href="#release">Read the release →</a>}>
        AuroraBoot is now part of Kairos: Factory, Deploy and Fleet in one console.
      </AnnouncementBar>

      <SiteHeader
        logo={
          <a href="#" aria-label="Kairos home">
            <ThemedKairosLogo height={34} />
          </a>
        }
        links={["Products", "Start here", "Docs", "Blog", "Community"].map((l) => ({
          label: l,
          href: `#${l.toLowerCase().replace(" ", "-")}`,
        }))}
        actions={
          <>
            <a
              href="#github"
              className="rounded-base border border-line px-2.5 py-[7px] font-mono text-xs whitespace-nowrap text-muted no-underline hover:text-ink"
            >
              ★ GitHub
            </a>
            <Button variant="dark">Quick start</Button>
          </>
        }
      />

      <Hero
        eyebrow="Kairos · CNCF sandbox project"
        title={
          <>
            Bring any Linux.
            <br />
            Run it immutable.
          </>
        }
        lede="Kairos turns Ubuntu, Fedora, Alpine or Hadron into images you build, boot, upgrade and recover the same way on every machine, from the edge to the datacenter."
      >
        <span className="text-sm font-semibold">Download Kairos with Hadron and k3s</span>
        <ArchPicker value={arch} onChange={setArch} />
        <div className="flex flex-wrap gap-2.5 pt-1.5">
          <Button size="lg">Download ISO · {h.archs[arch].name}</Button>
          <Button size="lg" variant="outline">
            Choose your path
          </Button>
        </div>
      </Hero>

      <SiteSection tone="lined" padding="none" innerClassName="flex flex-wrap items-center gap-5 py-5">
        <span className="font-mono text-xs text-muted">Bring your own base</span>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {h.bases.map((b, i) => (
            <li
              key={b}
              className={
                "rounded-base px-3 py-1.5 text-base font-semibold " +
                (i === 0 ? "bg-hadron-blue text-status-ink" : "")
              }
            >
              {b}
            </li>
          ))}
        </ul>
      </SiteSection>

      <SiteSection innerClassName="flex flex-col gap-9">
        <SectionHeading
          title="A project for every stage. One platform to run them."
          lede="Each project works on its own. The kairos CLI brings them together in one console."
          action={
            <a href="#auroraboot" className="text-base font-bold text-link no-underline">
              What happened to AuroraBoot? →
            </a>
          }
        />
        <FeatureGrid>
          {h.stages.map((s) => (
            <FeatureCell
              key={s.stage}
              marker={
                s.tone === "ink" ? (
                  <Tile size={24} className="fill-ink [&_polygon]:fill-ink" />
                ) : (
                  <Tile tone={s.tone} size={24} />
                )
              }
              label={s.stage}
            >
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-2 text-[22px]">
                  <KairosMark decorative height={22} />
                  Kairos <b className="font-bold">{s.name}</b>
                </span>
                <span className="text-base leading-normal text-sub">{s.job}</span>
                <span className="font-mono text-xs text-muted">{s.cmd}</span>
              </div>
            </FeatureCell>
          ))}
        </FeatureGrid>
        <div className="rounded-base bg-deep">
          <div
            data-theme="dark"
            className="grid items-stretch gap-5 p-7 text-ink [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]"
          >
            <div className="flex flex-col justify-center gap-2.5">
              <span className="flex items-center gap-2.5 text-[26px]">
                <KairosMark decorative height={28} />
                <b className="font-bold">Kairos</b> console
              </span>
              <span className="text-base leading-normal text-sub">
                One console for the whole lifecycle. Formerly AuroraBoot.
              </span>
              <span className="font-mono text-xs text-accent-soft">kairos ui</span>
            </div>
            {h.platformSections.map((s) => (
              <div key={s.t} className="flex flex-col gap-2 rounded-base bg-head p-[18px]">
                <span className="flex items-center gap-2 text-[19px] font-bold">
                  <Tile tone={s.tone} size={20} />
                  {s.t}
                </span>
                <span className="text-[15px] leading-normal text-sub">{s.d}</span>
              </div>
            ))}
          </div>
        </div>
      </SiteSection>

      <SiteSection tone="deep" innerClassName="flex flex-col gap-8">
        <SectionHeading eyebrow="Start here" title="Pick your path. Go as deep as you need." />
        <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {h.personas.map((p) => (
            <a
              key={p.name}
              href="#path"
              className="flex min-h-[250px] flex-col gap-3.5 rounded-base bg-head p-[22px] text-ink no-underline transition-colors hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <span className="text-[21px] leading-tight font-bold">{p.name}</span>
              <span className="flex-1 text-[15px] leading-normal text-sub">{p.need}</span>
              <span className="font-mono text-xs leading-[1.7] text-accent-soft">{p.flow}</span>
            </a>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5 text-[15px]">
          {h.levels.map((l) => (
            <span
              key={l.key}
              className="flex items-center gap-2.5 rounded-base border border-line px-3.5 py-2.5"
            >
              <b className={"font-mono text-xs " + l.tone}>{l.key}</b>
              {l.label}
            </span>
          ))}
        </div>
      </SiteSection>

      <SiteSection innerClassName="grid gap-12 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-[clamp(30px,3.4vw,40px)] leading-[1.1] font-semibold tracking-[-0.03em]">
            What’s inside every Kairos image
          </h2>
          <p className="m-0 text-[17px] leading-relaxed text-sub text-pretty">
            OCI image-based deployments, an immutable root and atomic upgrades through any registry, without
            locking you to one Linux or one Kubernetes.
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0 pt-2">
            {h.inside.map((i) => (
              <li key={i} className="rounded-sm bg-surface px-3 py-2 text-[15px] font-semibold">
                {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-base bg-surface">
          <Table className="text-[15px]">
            <TableHeader>
              <TableRow className="bg-raised">
                <TableHead className="w-[45%] text-[13px] font-bold text-ink">Capability</TableHead>
                <TableHead className="text-[13px] font-bold text-ink">Kairos</TableHead>
                <TableHead className="text-[13px] font-bold text-ink">Config mgmt</TableHead>
                <TableHead className="text-[13px] font-bold text-ink">Special-purpose OS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {h.compare.map(([k, a, b, c]) => (
                <TableRow key={k}>
                  <TableCell>{k}</TableCell>
                  <TableCell className="font-bold">{a}</TableCell>
                  <TableCell className="text-sub">{b}</TableCell>
                  <TableCell className="text-sub">{c}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SiteSection>

      <SiteSection padding="none" innerClassName="pb-16 md:pb-24">
        <div className="grid overflow-hidden rounded-base bg-surface [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          <div className="flex flex-col gap-[18px] p-7 md:p-12">
            <ThemedHadronLogo height={46} />
            <h3 className="m-0 text-[clamp(26px,3vw,34px)] leading-[1.15] font-semibold tracking-[-0.025em]">
              Smaller footprint, stronger baseline, the default base.
            </h3>
            <p className="m-0 text-[17px] leading-relaxed text-sub text-pretty">
              Hadron is a minimal Linux built from scratch with musl, systemd and vanilla kernels, made for
              immutable images. It ships with every Kairos release.
            </p>
            <a href="#hadron" className="text-base font-bold text-hadron-blue no-underline">
              Visit hadron-linux.io →
            </a>
          </div>
          <div className="relative min-h-[280px]">
            <TileField
              palette="hadron"
              seed={11}
              radius={34}
              width={600}
              height={340}
              fade={(u, v) => Math.max(0, 1 - Math.hypot(u - 1, v - 0.5) * 1.2)}
              preserveAspectRatio="xMaxYMid slice"
            />
          </div>
        </div>
      </SiteSection>

      <SiteSection
        tone="lined"
        className="border-b-0"
        innerClassName="grid gap-12 py-14 md:py-20 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h3 className="m-0 text-[28px] font-semibold tracking-[-0.02em]">Hot off the press</h3>
            <a href="#press" className="text-[15px] font-bold text-link no-underline">
              All press →
            </a>
          </div>
          {h.press.map((p) => (
            <a
              key={p.t}
              href="#post"
              className="flex flex-col gap-1 border-t border-line py-3.5 text-ink no-underline hover:text-link"
            >
              <span className="font-mono text-xs text-muted">CNCF blog · {p.d}</span>
              <span className="text-lg leading-[1.35] font-semibold">{p.t}</span>
            </a>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h3 className="m-0 text-[28px] font-semibold tracking-[-0.02em]">On the road</h3>
            <a href="#events" className="text-[15px] font-bold text-link no-underline">
              All events →
            </a>
          </div>
          {h.events.map((e) => (
            <div key={e.t} className="grid grid-cols-[76px_1fr] gap-4 border-t border-line py-3.5">
              <span className="font-mono text-[13px] leading-snug">{e.d}</span>
              <div className="flex flex-col gap-1">
                <span className="text-lg leading-[1.35] font-semibold">{e.t}</span>
                <span className="text-sm text-muted">{e.w}</span>
              </div>
            </div>
          ))}
        </div>
      </SiteSection>

      <SiteSection
        tone="raised"
        padding="none"
        innerClassName="flex flex-wrap items-center justify-between gap-6 py-12"
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-[22px] font-bold">Organizations using Kairos</span>
          <span className="text-[15px] text-sub">
            Bare metal, edge and distributed infrastructure, as we pursue CNCF incubation.
          </span>
        </div>
        <ul className="m-0 flex list-none flex-wrap gap-7 p-0 text-xl font-bold text-sub">
          {h.adopters.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </SiteSection>

      <SiteFooter
        brand={
          <>
            <KairosLogo variant="dark" height={32} />
            <span>A Cloud Native Computing Foundation sandbox project.</span>
          </>
        }
        columns={h.footer}
        legal="Copyright © 2026 Kairos a Series of LF Projects, LLC"
        note="Project supported by Spectro Cloud"
      />
    </div>
  );
}

const meta = {
  title: "Pages/kairos.io/Homepage",
  component: Homepage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`kairos.io Homepage.dc.html`, built from the package: `AnnouncementBar`, `SiteHeader`, `Hero` with a `TileField`, `SiteSection` and `SectionHeading`, `FeatureGrid` with `Tile` markers, `Table`, `KairosMark`, `KairosLogo`, `HadronLogo`, `Button` and `SiteFooter`. The architecture choice is a local radio group until the choice cards land. Switch the toolbar theme: the lockups follow it.",
      },
    },
  },
} satisfies Meta<typeof Homepage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
