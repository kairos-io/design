import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DocsNav, DocsToc } from "../../components/DocsNav/DocsNav.tsx";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl.tsx";
import { Terminal } from "../../components/Terminal/Terminal.tsx";
import { HadronMark, KairosMark } from "../../components/Logo/Logo.tsx";
import { SiteHeader } from "../../components/SiteHeader/SiteHeader.tsx";
import {
  Diamond,
  ThemedKairosLogo,
  docsLevels,
  docsProducts,
  docsSidebar,
  type DocsLevel,
  type DocsProduct,
} from "./fixtures.tsx";

function ProductPage() {
  const [product, setProduct] = useState<DocsProduct>("Console");
  const [level, setLevel] = useState<DocsLevel>("L1");
  const p = docsProducts[product];
  const lv = docsLevels.find((l) => l.k === level) ?? docsLevels[0];
  const next = docsLevels[(docsLevels.indexOf(lv) + 1) % docsLevels.length].k;

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <SiteHeader
        bordered
        logo={
          <a href="#" aria-label="Kairos docs home">
            <ThemedKairosLogo height={30} />
          </a>
        }
        links={[
          { label: "Docs", href: "#docs", current: true },
          { label: "Start here", href: "#start" },
          { label: "Reference", href: "#reference" },
          { label: "Blog", href: "#blog" },
        ]}
        actions={
          <>
            <button
              type="button"
              className="rounded-base border border-line px-2.5 py-[7px] font-mono text-xs whitespace-nowrap"
            >
              v4.3.0 ▾
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-base border border-line px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap"
            >
              <HadronMark decorative height={16} />
              Hadron ▾
            </button>
            <button
              type="button"
              aria-label="Search docs"
              className="flex w-60 justify-between rounded-base border-[1.5px] border-line bg-surface px-3 py-[7px] text-sm text-muted"
            >
              Search docs
              <span className="font-mono text-xs">⌘K</span>
            </button>
          </>
        }
      />

      <div className="flex flex-1 flex-wrap">
        <DocsNav
          groups={docsSidebar.map((g) => ({
            title: g.title,
            items: g.items.map((x) => ({ label: x, href: `#${x}`, current: x === product })),
          }))}
          onNavigate={(href) => {
            const name = href.slice(1) as DocsProduct;
            if (name in docsProducts) {
              setProduct(name);
              setLevel("L1");
            }
          }}
        />

        {/* The article column wraps under the navigation once the two no longer fit side by side, as in the deck. */}
        <main className="flex min-w-0 grow basis-80 flex-wrap justify-center">
          <article
            className="flex min-w-[320px] flex-1 flex-col gap-6 px-6 pt-10 pb-20 md:px-14"
            style={{ maxWidth: 800 }}
          >
            <span className="font-mono text-xs text-muted">Products / {product}</span>
            <div className="flex items-center gap-4">
              <KairosMark decorative height={48} />
              <h1 className="m-0 text-[clamp(38px,5vw,52px)] leading-none font-normal tracking-[-0.035em]">
                Kairos <b className="font-bold">{product}</b>
              </h1>
            </div>
            <p className="m-0 text-body-lg text-sub text-pretty">{p.lede}</p>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              <span className="rounded-sm bg-raised px-2 py-1">repo: {p.repo}</span>
              <span className="rounded-sm bg-raised px-2 py-1">formerly: {p.was}</span>
            </div>

            <SegmentedControl<DocsLevel>
              aria-label="Docs level"
              value={level}
              onChange={setLevel}
              options={docsLevels.map((l) => ({ value: l.k, code: l.k, label: l.t, hint: l.who }))}
              className="mt-2"
            />

            <h2 className="m-0 mt-4 text-[28px] font-semibold tracking-[-0.02em]">{lv.h}</h2>
            <p className="m-0 text-[17px] leading-[1.7] text-pretty">{lv.body}</p>
            <Terminal
              aria-label={`${lv.file} sample`}
              title={lv.file}
              copy
              lines={lv.code.split("\n")}
              autoscroll={false}
            />
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {lv.steps.map((s, i) => (
                <li key={s} className="grid grid-cols-[32px_1fr] gap-3 text-base leading-relaxed">
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-sm bg-raised font-mono text-xs">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <div className="grid grid-cols-[18px_1fr] gap-3 rounded-base bg-surface px-[18px] py-4 text-base leading-[1.55]">
              <Diamond size={14} className="fill-accent" />
              <span>
                <b>{lv.bridgeT}</b> {lv.bridge}{" "}
                <button type="button" onClick={() => setLevel(next)} className="font-bold text-link">
                  {lv.cta} →
                </button>
              </span>
            </div>
            <nav aria-label="Pagination" className="mt-6 grid grid-cols-2 gap-2.5">
              <a
                href="#installer"
                className="flex flex-col gap-0.5 rounded-base border border-line px-4 py-3.5 text-ink no-underline hover:border-ink"
              >
                <span className="text-[13px] text-muted">Previous</span>
                <span className="text-[17px] font-bold">Kairos Installer</span>
              </a>
              <a
                href="#operator"
                className="flex flex-col gap-0.5 rounded-base border border-line px-4 py-3.5 text-right text-ink no-underline hover:border-ink"
              >
                <span className="text-[13px] text-muted">Next</span>
                <span className="text-[17px] font-bold">Kairos Operator</span>
              </a>
            </nav>
          </article>
          <DocsToc
            items={[
              { label: "Overview", href: "#overview" },
              { label: lv.h, href: "#level", current: true },
              { label: "Steps", href: "#steps" },
              { label: "Next level", href: "#next" },
            ]}
            action={<a href="#edit">Edit this page</a>}
          />
        </main>
      </div>
    </div>
  );
}

const meta = {
  title: "Pages/Docs/Product page",
  component: ProductPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`Kairos Docs - Product Page.dc.html`: a product page with the L1 / L2 / L3 maturity tracks. Built from `SiteHeader`, `DocsNav` and `DocsToc`, `SegmentedControl`, `Terminal`, `KairosMark` and `HadronMark`. Pick a product in the navigation and a level in the track; the article follows, as the deck does.",
      },
    },
  },
} satisfies Meta<typeof ProductPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
