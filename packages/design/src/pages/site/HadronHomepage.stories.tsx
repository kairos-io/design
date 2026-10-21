import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../components/Button/Button.tsx";
import { CommandSample } from "../../components/CommandSample/CommandSample.tsx";
import { FeatureCell, FeatureGrid } from "../../components/FeatureGrid/FeatureGrid.tsx";
import { Hero } from "../../components/Hero/Hero.tsx";
import { HadronLogo, KairosLogo } from "../../components/Logo/Logo.tsx";
import { SiteFooter } from "../../components/SiteFooter/SiteFooter.tsx";
import { SiteHeader } from "../../components/SiteHeader/SiteHeader.tsx";
import { SiteSection } from "../../components/SiteSection/SiteSection.tsx";
import { Tile } from "../../components/Tiles/Tile.tsx";
import { Diamond, ThemedHadronLogo, hadronHome } from "./fixtures.tsx";

function Homepage() {
  const h = hadronHome;
  return (
    // The Hadron variant on the page root: the accent, the ink on it and the
    // links turn blue in either theme. The footer and the deep card nest their
    // own data-theme="dark" below the variant, so they read the variant's
    // light values; nothing in them paints with the accent, so it does not
    // show. A page that needs the accent inside a nested dark section puts
    // data-variant on that section as well.
    <div data-variant="hadron" className="min-h-screen bg-bg text-ink">
      <SiteHeader
        logo={
          <a href="#" aria-label="Hadron home">
            <ThemedHadronLogo height={46} />
          </a>
        }
        links={[
          { label: "Components", href: "#components" },
          { label: "Docs", href: "#docs" },
          { label: "Source", href: "#source" },
          { label: "kairos.io ↗", href: "#kairos" },
        ]}
        actions={<Button>Quick start</Button>}
      />

      <Hero
        palette="hadron"
        bordered
        tiles={{ seed: 7, height: 640 }}
        eyebrow="Hadron v0.5.1 · by Kairos"
        title="The foundation for image-based systems."
        lede="A minimal, upstream-aligned Linux built from scratch with musl, systemd and vanilla kernels. No package manager. Designed for predictable cloud and edge environments."
      >
        <div className="flex flex-wrap gap-2.5">
          <Button size="lg">Get Hadron with Kairos</Button>
          <Button size="lg" variant="outline">
            Component versions
          </Button>
        </div>
        <CommandSample command="docker pull quay.io/kairos/hadron:v0.5.1" />
      </Hero>

      <SiteSection innerClassName="flex flex-col gap-8">
        <h2 className="m-0 max-w-[640px] text-[clamp(32px,4vw,46px)] leading-[1.05] font-semibold tracking-[-0.035em]">
          Small on purpose.
        </h2>
        <FeatureGrid>
          {h.principles.map((p) => (
            <FeatureCell key={p.t} className="min-h-[200px] gap-2.5 p-[26px]">
              <Tile palette="hadron" tone={p.tone} size={24} />
              <span className="mt-auto text-[22px] font-bold">{p.t}</span>
              <span className="text-base leading-[1.55] text-sub">{p.d}</span>
            </FeatureCell>
          ))}
        </FeatureGrid>
      </SiteSection>

      <SiteSection
        padding="none"
        innerClassName="grid items-start gap-6 pb-16 md:pb-24 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]"
      >
        <div className="rounded-base bg-deep">
          <div data-theme="dark" className="flex flex-col gap-[18px] p-7 text-ink md:p-11">
            <span className="flex items-center gap-2.5 text-[15px] text-sub">
              Topped with <KairosLogo variant="dark" height={24} />
            </span>
            <h3 className="m-0 text-[clamp(26px,3vw,34px)] leading-[1.15] font-semibold tracking-[-0.025em]">
              Hadron becomes immutable, with the full Kairos lifecycle.
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {h.withKairos.map((w) => (
                <li key={w} className="grid grid-cols-[20px_1fr] gap-2.5 text-base leading-normal">
                  <Diamond className="fill-hadron-sky" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
            <a href="#kairos" className="text-base font-bold text-accent-soft no-underline">
              Explore Kairos →
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-base bg-surface">
          <div className="flex justify-between bg-raised px-5 py-3.5 text-sm font-bold">
            <span>Component</span>
            <span className="font-mono text-xs font-normal">v0.5.1</span>
          </div>
          <dl className="m-0">
            {h.components.map(([k, v]) => (
              <div key={k} className="flex justify-between border-t border-line px-5 py-3 text-[15px]">
                <dt>{k}</dt>
                <dd className="m-0 font-mono text-[13px]">{v}</dd>
              </div>
            ))}
          </dl>
          <a
            href="#versions"
            className="block border-t border-line px-5 py-3.5 text-[15px] font-bold text-link no-underline"
          >
            All component versions →
          </a>
        </div>
      </SiteSection>

      <SiteFooter
        compact
        brand={
          <>
            <HadronLogo variant="dark" height={36} />
            <span>Engineered by the Kairos team · ships with every Kairos release</span>
          </>
        }
      >
        <div className="flex gap-5 text-sm">
          {["GitHub", "Docs", "kairos.io"].map((l) => (
            <a key={l} href={`#${l}`} className="text-sub no-underline hover:text-ink">
              {l}
            </a>
          ))}
        </div>
      </SiteFooter>
    </div>
  );
}

const meta = {
  title: "Pages/hadron-linux.io/Homepage",
  component: Homepage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          '`hadron-linux.io Homepage.dc.html`: the same system with `data-variant="hadron"` on the page root, so the accent is Hadron blue with white ink and the links are the Hadron blues, in both themes. Built from `SiteHeader`, `Hero` with the Hadron `TileField`, `CommandSample`, `FeatureGrid` with Hadron `Tile` markers, `SiteSection`, `HadronLogo`, `KairosLogo`, `Button` and the compact `SiteFooter`.',
      },
    },
  },
} satisfies Meta<typeof Homepage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
