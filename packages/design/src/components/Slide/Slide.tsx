import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { HadronLogo, KairosLogo, KairosMark } from "../Logo/Logo.tsx";
import { TileField } from "../Tiles/TileField.tsx";
import { tilePalettes, type TilePalette, type TileTone } from "../../lib/tiles.ts";

// The conference slide template, from the talk deck in this repository
// ("Kairos - Talk Deck.dc.html"): 1920 by 1080, light mode only, Urbanist
// and Martian Mono, the three oranges, nothing under 24px. Each layout is a
// component; the Slide frame scales the design size to its container.

export const SLIDE_WIDTH = 1920;
export const SLIDE_HEIGHT = 1080;

export type SlideBrand = "kairos" | "hadron";

export interface SlideProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hadron talks take the Hadron blues: the tiles, the accent and the links. */
  brand?: SlideBrand;
  /** The ground: the canvas (default) or a surface, for the quote and demo slides. */
  surface?: "bg" | "surface" | "accent";
  /** Text in the footer, beside the mark. Omit for slides without one. */
  footer?: React.ReactNode;
  /** Speaker notes, kept with the slide and exposed to assistive tech only. */
  notes?: string;
}

/**
 * A 16:9 slide frame. The content is laid out at 1920×1080 and scaled to the
 * width of the frame, so a story shows a whole slide and a projector shows it
 * at full size. The frame forces the light theme, as the deck rules require,
 * and takes `data-variant="hadron"` for a Hadron talk.
 */
export const Slide = React.forwardRef<HTMLDivElement, SlideProps>(function Slide(
  { brand = "kairos", surface = "bg", footer, notes, className, style, children, ...props },
  ref,
) {
  const outer = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(1);

  React.useLayoutEffect(() => {
    const el = outer.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => setScale(el.clientWidth / SLIDE_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ground = surface === "accent" ? "bg-accent" : surface === "surface" ? "bg-surface" : "bg-bg";

  return (
    <div
      ref={(node) => {
        outer.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-theme="light"
      data-variant={brand === "hadron" ? "hadron" : undefined}
      className={cn("relative w-full overflow-hidden rounded-base bg-bg text-ink", className)}
      style={{ aspectRatio: `${SLIDE_WIDTH} / ${SLIDE_HEIGHT}`, ...style }}
      {...props}
    >
      <div
        className={cn("absolute left-0 top-0 overflow-hidden font-sans", ground)}
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
        {footer ? (
          <div className="absolute bottom-[56px] left-[120px] right-[120px] flex items-center gap-5 text-[24px] text-muted">
            <KairosMark className="h-9 w-auto" aria-hidden="true" />
            <span>{footer}</span>
          </div>
        ) : null}
      </div>
      {notes ? <p className="sr-only">{notes}</p> : null}
    </div>
  );
});

const palette = (brand: SlideBrand): TilePalette => (brand === "hadron" ? "hadron" : "kairos");

/** The mono eyebrow the deck sets above titles. */
function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[26px] text-muted", className)}>{children}</span>;
}

/** The slide's own tile field on the right, dense at the edge and fading towards the text. */
function SlideTiles({
  brand,
  left = "46%",
  seed = 5,
  radius = 64,
  line,
}: {
  brand: SlideBrand;
  left?: string;
  seed?: number;
  radius?: number;
  line?: string;
}) {
  return (
    <div className="absolute inset-y-0 right-0" style={{ left }}>
      <TileField
        palette={palette(brand)}
        fade="right"
        seed={seed}
        radius={radius}
        width={1040}
        height={1080}
        line={line}
        aria-hidden="true"
      />
    </div>
  );
}

/** The lockup for the brand: the Kairos or the Hadron horizontal logo, as the decks set them. Slides are light, so the colour rendition. */
function BrandLogo({ brand }: { brand: SlideBrand }) {
  if (brand === "hadron") return <HadronLogo className="h-16 w-auto self-start" />;
  return <KairosLogo layout="horizontal" className="h-16 w-auto self-start" />;
}

export interface SlideTitleProps extends Omit<SlideProps, "title"> {
  event: React.ReactNode;
  title: React.ReactNode;
  speaker: React.ReactNode;
  affiliation: React.ReactNode;
}

/** Title slide: event, the talk title under eight words, the speaker. */
export function SlideTitle({
  event,
  title,
  speaker,
  affiliation,
  brand = "kairos",
  ...props
}: SlideTitleProps) {
  return (
    <Slide
      brand={brand}
      notes="Title slide. Talk title, your name, event and date. Keep the title under ~8 words."
      {...props}
    >
      <SlideTiles brand={brand} />
      <div className="absolute inset-0 flex flex-col justify-between p-[110px_120px]">
        <BrandLogo brand={brand} />
        <div className="flex max-w-[1000px] flex-col gap-9">
          <Eyebrow>{event}</Eyebrow>
          <h1 className="m-0 text-balance text-[124px] font-semibold leading-[0.98] tracking-[-0.04em]">
            {title}
          </h1>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[38px] font-bold">{speaker}</span>
          <span className="text-[30px] text-sub">{affiliation}</span>
        </div>
      </div>
    </Slide>
  );
}

export interface SlideSpeakerProps extends SlideProps {
  name: React.ReactNode;
  lines: React.ReactNode[];
  handle: React.ReactNode;
  photo?: React.ReactNode;
}

/** Speaker slide: a square photo and three lines on who you are. */
export function SlideSpeaker({ name, lines, handle, photo, ...props }: SlideSpeakerProps) {
  return (
    <Slide notes="Optional. Thirty seconds on who you are and why you're giving this talk." {...props}>
      <div className="absolute inset-0 grid grid-cols-[560px_1fr] items-center gap-[120px] p-[120px]">
        <div className="flex h-[560px] w-[560px] items-center justify-center overflow-hidden rounded-base bg-raised text-[28px] text-muted">
          {photo ?? "Speaker photo, square"}
        </div>
        <div className="flex flex-col gap-10">
          <Eyebrow>About me</Eyebrow>
          <h2 className="m-0 text-[96px] font-semibold leading-none tracking-[-0.035em]">{name}</h2>
          <div className="flex flex-col gap-5 text-[36px] leading-[1.4] text-sub">
            {lines.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
          <span className="font-mono text-[28px] text-link">{handle}</span>
        </div>
      </div>
    </Slide>
  );
}

/** The parallelogram the deck uses as a bullet: the three tile tones in the logo's order, then ink. */
function Parallelogram({
  index,
  brand = "kairos",
  className,
}: {
  index: number;
  brand?: SlideBrand;
  className?: string;
}) {
  const i = index % 4;
  const fill = i === 3 ? "var(--ink)" : tilePalettes[palette(brand)][i as TileTone];
  return (
    <span
      aria-hidden="true"
      className={cn("block", className)}
      style={{ clipPath: "polygon(32% 0, 100% 0, 68% 100%, 0 100%)", background: fill }}
    />
  );
}

export interface SlideAgendaProps extends SlideProps {
  heading?: React.ReactNode;
  items: React.ReactNode[];
}

/** Agenda: three to five items on surface cards, matching the section dividers. */
export function SlideAgenda({ heading = "Agenda", items, brand = "kairos", ...props }: SlideAgendaProps) {
  return (
    <Slide
      brand={brand}
      notes="Agenda. Three to five items. These should match your section divider titles exactly."
      {...props}
    >
      <div className="absolute inset-0 flex flex-col gap-[72px] p-[110px_120px_100px]">
        <h2 className="m-0 text-[80px] font-semibold leading-none tracking-[-0.035em]">{heading}</h2>
        <div className="grid flex-1 gap-4" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
          {items.map((item, i) => (
            <div key={i} className="flex flex-col justify-between rounded-base bg-surface p-[48px_40px]">
              <Parallelogram index={i} brand={brand} className="h-[42px] w-[66px]" />
              <div className="flex flex-col gap-4">
                <Eyebrow>{String(i + 1).padStart(2, "0")}</Eyebrow>
                <span className="text-[48px] font-semibold leading-[1.05] tracking-[-0.02em]">{item}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

export interface SlideDividerProps extends Omit<SlideProps, "title"> {
  number: React.ReactNode;
  title: React.ReactNode;
}

/** Section divider on the accent, with the tiles fading in from the right. */
export function SlideDivider({ number, title, brand = "kairos", ...props }: SlideDividerProps) {
  return (
    <Slide
      brand={brand}
      surface="accent"
      notes="Section divider. Duplicate for each agenda item; change the number and title only."
      {...props}
    >
      <SlideTiles brand={brand} left="52%" seed={11} radius={72} line="var(--accent-soft)" />
      <div className="absolute inset-0 flex flex-col justify-end gap-8 p-[110px_120px] text-on-accent">
        <span className="font-mono text-[34px]">{number}</span>
        <h2 className="m-0 max-w-[960px] text-[144px] font-semibold leading-[0.95] tracking-[-0.045em]">
          {title}
        </h2>
      </div>
    </Slide>
  );
}

export interface SlideStatementProps extends SlideProps {
  statement: React.ReactNode;
  detail?: React.ReactNode;
}

/** One idea, said plainly. Once or twice per talk. */
export function SlideStatement({ statement, detail, ...props }: SlideStatementProps) {
  return (
    <Slide notes="One idea, said plainly. Use sparingly: once or twice per talk." {...props}>
      <div className="absolute inset-0 flex flex-col justify-center gap-12 p-[120px]">
        <h2 className="m-0 max-w-[1500px] text-balance text-[104px] font-semibold leading-[1.04] tracking-[-0.04em]">
          {statement}
        </h2>
        {detail ? <span className="max-w-[1100px] text-[36px] leading-[1.4] text-sub">{detail}</span> : null}
      </div>
    </Slide>
  );
}

export interface SlideListProps extends SlideProps {
  heading: React.ReactNode;
  items: { title: React.ReactNode; detail: React.ReactNode }[];
}

/** Content list: a heading and three to four points, one line each. */
export function SlideList({ heading, items, brand = "kairos", ...props }: SlideListProps) {
  return (
    <Slide
      brand={brand}
      notes="Standard content slide. Three to four points, one line each where possible."
      {...props}
    >
      <div className="absolute inset-0 grid grid-cols-[1fr_1.25fr] gap-[120px] p-[110px_120px_140px]">
        <h2 className="m-0 text-[80px] font-semibold leading-[1.02] tracking-[-0.035em]">{heading}</h2>
        <div className="flex flex-col gap-12 pt-3">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-[48px_1fr] items-start gap-7">
              <Parallelogram index={i} brand={brand} className="mt-2 h-[31px] w-[48px]" />
              <div className="flex flex-col gap-2">
                <span className="text-[40px] font-bold leading-[1.15]">{it.title}</span>
                <span className="text-[32px] leading-[1.4] text-sub">{it.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

export type SlideTerminalLine =
  | { kind: "command"; text: React.ReactNode }
  | { kind: "output"; text: React.ReactNode }
  | { kind: "comment"; text: React.ReactNode }
  | { kind: "ok"; text: React.ReactNode };

export interface SlideTerminalProps extends SlideProps {
  heading: React.ReactNode;
  path?: React.ReactNode;
  tool?: React.ReactNode;
  lines: SlideTerminalLine[];
}

/** A light terminal for CLI walkthroughs: six to ten lines, prompt in the link colour. */
export function SlideTerminal({ heading, path = "~", tool = "kairos", lines, ...props }: SlideTerminalProps) {
  const color: Record<SlideTerminalLine["kind"], string> = {
    command: "text-ink",
    output: "text-sub",
    comment: "text-muted",
    ok: "text-ok",
  };
  return (
    <Slide
      notes="Light terminal for CLI walkthroughs. Keep it to 6–10 lines so the back row can read it."
      {...props}
    >
      <div className="absolute inset-0 flex flex-col gap-14 p-[110px_120px_140px]">
        <h2 className="m-0 text-[80px] font-semibold leading-none tracking-[-0.035em]">{heading}</h2>
        <div className="flex flex-1 flex-col overflow-hidden rounded-base border-2 border-line bg-surface">
          <div className="flex h-16 items-center justify-between bg-raised px-8 font-mono text-[24px] text-sub">
            <span>{path}</span>
            <span>{tool}</span>
          </div>
          <div className="flex flex-col gap-3.5 p-[40px_48px] font-mono text-[32px] leading-[1.45]">
            {lines.map((l, i) => (
              <span key={i} className={color[l.kind]}>
                {l.kind === "command" ? (
                  <span className="text-link">$ </span>
                ) : l.kind === "output" ? (
                  "  "
                ) : null}
                {l.kind === "comment" ? "# " : null}
                {l.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  );
}

export interface SlideCodeProps extends SlideProps {
  file: React.ReactNode;
  /** Lines of code; wrap a key in `<SlideCodeKey>` to colour it. */
  code: React.ReactNode;
  heading: React.ReactNode;
  points: { key: React.ReactNode; detail: React.ReactNode }[];
}

/** A key in a code slide, in the link colour. */
export function SlideCodeKey({ children }: { children: React.ReactNode }) {
  return <span className="text-link">{children}</span>;
}

/** Config on the left, what it does on the right. At most three keys. */
export function SlideCode({ file, code, heading, points, ...props }: SlideCodeProps) {
  return (
    <Slide notes="Config on the left, what it does on the right. Highlight at most three keys." {...props}>
      <div className="absolute inset-0 grid grid-cols-[1.15fr_1fr] gap-24 p-[110px_120px_140px]">
        <div className="flex flex-col overflow-hidden rounded-base border-2 border-line bg-surface">
          <div className="flex h-16 items-center bg-raised px-8 font-mono text-[24px] text-sub">{file}</div>
          <pre className="m-0 whitespace-pre p-[40px_48px] font-mono text-[30px] leading-[1.5]">{code}</pre>
        </div>
        <div className="flex flex-col justify-center gap-14">
          <h2 className="m-0 text-[72px] font-semibold leading-[1.02] tracking-[-0.035em]">{heading}</h2>
          <div className="flex flex-col gap-8 text-[32px] leading-[1.4] text-sub">
            {points.map((p, i) => (
              <span key={i}>
                <span className="font-bold text-ink">{p.key}</span> {p.detail}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  );
}

export interface SlideLifecycleProps extends SlideProps {
  heading: React.ReactNode;
  stages: { stage: React.ReactNode; product: React.ReactNode; detail: React.ReactNode }[];
}

/** The lifecycle: Build, Deploy, Operate and Learn, each with its product. */
export function SlideLifecycle({ heading, stages, brand = "kairos", ...props }: SlideLifecycleProps) {
  return (
    <Slide
      brand={brand}
      notes="The Kairos lifecycle. Factory, Installer, Operator and Lab are products; Build, Deploy, Operate and Learn are what you do with them."
      {...props}
    >
      <div className="absolute inset-0 flex flex-col gap-20 p-[110px_120px_140px]">
        <h2 className="m-0 text-[80px] font-semibold leading-none tracking-[-0.035em]">{heading}</h2>
        <div className="grid flex-1 gap-4" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
          {stages.map((s, i) => (
            <div key={i} className="flex flex-col gap-7">
              <Parallelogram index={i} brand={brand} className="h-14 w-full" />
              <Eyebrow>{s.stage}</Eyebrow>
              <span className="text-[52px] font-semibold tracking-[-0.02em]">{s.product}</span>
              <span className="text-[30px] leading-[1.4] text-sub">{s.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

export interface SlideTableProps extends SlideProps {
  heading: React.ReactNode;
  columns: [React.ReactNode, React.ReactNode];
  rows: { label: React.ReactNode; before: React.ReactNode; after: React.ReactNode }[];
}

/** Comparison table: three to five rows; the Kairos column is the one to read. */
export function SlideTable({ heading, columns, rows, ...props }: SlideTableProps) {
  return (
    <Slide notes="Comparison table. Three to five rows; the Kairos column is the one to read." {...props}>
      <div className="absolute inset-0 flex flex-col gap-16 p-[110px_120px_140px]">
        <h2 className="m-0 text-[80px] font-semibold leading-none tracking-[-0.035em]">{heading}</h2>
        <div className="flex flex-col overflow-hidden rounded-base bg-surface">
          <div className="grid grid-cols-[1fr_1.3fr_1.3fr] bg-raised p-[28px_48px] text-[30px] font-bold">
            <span />
            <span>{columns[0]}</span>
            <span className="text-link">{columns[1]}</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1.3fr_1.3fr] border-t-2 border-inner p-[32px_48px] text-[32px]"
            >
              <span className="font-bold">{r.label}</span>
              <span className="text-sub">{r.before}</span>
              <span>{r.after}</span>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

export interface SlideNumberProps extends SlideProps {
  figure: React.ReactNode;
  caption: React.ReactNode;
  source: React.ReactNode;
}

/** Big number: one figure with a source. */
export function SlideNumber({ figure, caption, source, brand = "kairos", ...props }: SlideNumberProps) {
  return (
    <Slide brand={brand} notes="One figure with a source. Only use numbers you can back up." {...props}>
      <SlideTiles brand={brand} left="58%" seed={3} radius={60} />
      <div className="absolute inset-0 flex flex-col justify-center gap-6 p-[120px]">
        <span className="text-[340px] font-semibold leading-[0.85] tracking-[-0.06em] text-accent">
          {figure}
        </span>
        <span className="max-w-[900px] text-[64px] font-semibold leading-[1.05] tracking-[-0.025em]">
          {caption}
        </span>
        <span className="text-[26px] italic text-muted">{source}</span>
      </div>
    </Slide>
  );
}

export interface SlideImageProps extends SlideProps {
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  text: React.ReactNode;
  image?: React.ReactNode;
}

/** Image and text: a photo or diagram on the right, short context on the left. */
export function SlideImage({ eyebrow, heading, text, image, ...props }: SlideImageProps) {
  return (
    <Slide notes="Photo or diagram on the right, short context on the left." {...props}>
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="flex flex-col justify-center gap-10 p-[110px_96px_140px_120px]">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 className="m-0 text-[80px] font-semibold leading-[1.02] tracking-[-0.035em]">{heading}</h2>
          <span className="text-[34px] leading-[1.45] text-sub">{text}</span>
        </div>
        <div className="relative flex items-center justify-center bg-raised text-[28px] text-muted">
          {image ?? "Photo or diagram"}
        </div>
      </div>
    </Slide>
  );
}

export interface SlideScreenshotProps extends SlideProps {
  heading: React.ReactNode;
  address: React.ReactNode;
  image?: React.ReactNode;
}

/** Screenshot: the console or docs, cropped to the part you're talking about. */
export function SlideScreenshot({ heading, address, image, ...props }: SlideScreenshotProps) {
  return (
    <Slide
      notes="Console or docs screenshot. Crop to the part you're talking about; don't shrink a full page."
      {...props}
    >
      <div className="absolute inset-0 flex flex-col gap-12 p-[110px_120px_140px]">
        <h2 className="m-0 text-[80px] font-semibold leading-none tracking-[-0.035em]">{heading}</h2>
        <div className="flex flex-1 flex-col overflow-hidden rounded-base border-2 border-line bg-surface">
          <div className="flex h-14 items-center bg-raised px-7 font-mono text-[24px] text-sub">
            {address}
          </div>
          <div className="relative flex flex-1 items-center justify-center text-[28px] text-muted">
            {image ?? "Console screenshot"}
          </div>
        </div>
      </div>
    </Slide>
  );
}

export interface SlideQuoteProps extends SlideProps {
  quote: React.ReactNode;
  name: React.ReactNode;
  affiliation: React.ReactNode;
}

/** A user or community quote, attributed, on a surface. */
export function SlideQuote({ quote, name, affiliation, brand = "kairos", ...props }: SlideQuoteProps) {
  return (
    <Slide
      brand={brand}
      surface="surface"
      notes="A user or community quote. Get permission and attribute it."
      {...props}
    >
      <div className="absolute inset-0 flex flex-col justify-center gap-14 p-[140px_120px]">
        <Parallelogram index={2} brand={brand} className="h-[76px] w-[120px]" />
        <span className="max-w-[1500px] text-balance text-[76px] font-medium leading-[1.12] tracking-[-0.025em]">
          {quote}
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[34px] font-bold">{name}</span>
          <span className="text-[28px] text-sub">{affiliation}</span>
        </div>
      </div>
    </Slide>
  );
}

export interface SlideDemoProps extends SlideProps {
  command?: React.ReactNode;
  heading?: React.ReactNode;
}

/** Demo divider: switch to your terminal after this slide. */
export function SlideDemo({
  command = "kairos ui",
  heading = "Live demo",
  brand = "kairos",
  ...props
}: SlideDemoProps) {
  return (
    <Slide
      brand={brand}
      surface="surface"
      notes="Demo divider. Switch to your terminal after this slide. Bump terminal font to at least 24pt."
      {...props}
    >
      <SlideTiles brand={brand} left="52%" seed={9} radius={72} line="var(--raised)" />
      <div className="absolute inset-0 flex flex-col justify-end gap-10 p-[110px_120px]">
        <span className="font-mono text-[40px]">
          <span className="text-link">$ </span>
          {command}
        </span>
        <h2 className="m-0 text-[144px] font-semibold leading-[0.95] tracking-[-0.045em]">{heading}</h2>
      </div>
    </Slide>
  );
}

export interface SlideClosingProps extends SlideProps {
  heading?: React.ReactNode;
  links: React.ReactNode[];
  handle?: React.ReactNode;
}

/** Closing: leave it up during questions so people can photograph the links. */
export function SlideClosing({
  heading = "Thank you",
  links,
  handle,
  brand = "kairos",
  ...props
}: SlideClosingProps) {
  return (
    <Slide
      brand={brand}
      notes="Closing. Leave this up during Q&A so people can photograph the links."
      {...props}
    >
      <SlideTiles brand={brand} left="52%" />
      <div className="absolute inset-0 flex flex-col justify-between p-[110px_120px]">
        <BrandLogo brand={brand} />
        <h2 className="m-0 text-[144px] font-semibold leading-[0.95] tracking-[-0.045em]">{heading}</h2>
        <div className="flex flex-col gap-[18px] font-mono text-[32px]">
          {links.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
          {handle ? <span className="text-sub">{handle}</span> : null}
        </div>
      </div>
    </Slide>
  );
}
