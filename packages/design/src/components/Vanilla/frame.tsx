import { useMemo } from "react";
import tokensCss from "../../../tokens.css?raw";
import fontsCss from "../../../src/assets/fonts/fonts.css?raw";
import componentsCss from "../../styles/components.css?raw";
import { logos } from "../Logo/logos.generated.ts";
import { DIAMOND_POINTS, DIAMOND_VIEWBOX } from "../../lib/diamond.ts";
import { useDocumentTheme } from "../../hooks/useDocumentTheme.ts";

// The vanilla layer is for pages with no build step, so a story renders a
// real one: an iframe whose document links nothing and bundles nothing, just
// tokens.css and components.css inline (and the font faces, pointed at the
// files Storybook serves from src/assets). The frame follows the Storybook
// theme by copying the data-theme attribute onto its own <html>.

// A srcdoc document resolves relative URLs against the parent page, which is
// iframe.html at the Storybook's own path (/iframe.html in the dev server,
// /storybook/iframe.html on the Pages site). Resolving once here keeps the
// fonts loading under either.
function fontFaces(): string {
  const base = typeof window === "undefined" ? "fonts/" : new URL("fonts/", window.location.href).href;
  return fontsCss.replaceAll("url(", `url(${base}`);
}

/** A complete HTML document: the page's own markup with the stylesheets inline. */
function vanillaPage(body: string, theme: "light" | "dark", variant?: string, title = "Kairos"): string {
  const variantAttr = variant ? ` data-variant="${variant}"` : "";
  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}"${variantAttr}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${fontFaces()}</style>
<style>${tokensCss}</style>
<style>${componentsCss}</style>
</head>
<body>${body}</body>
</html>`;
}

/** The mark as inline SVG, from the same generated artwork data the Logo component uses. */
export function markSvg(height = 28): string {
  const mark = logos["icon-color"];
  return `<svg viewBox="${mark.viewBox}" aria-hidden="true" focusable="false" style="height:${height}px;width:auto;display:block">${mark.shapes
    .map(
      (s) =>
        `<${s.tag} ${Object.entries(s.attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ")}/>`,
    )
    .join("")}</svg>`;
}

/** The diamond the system draws for a status, as inline SVG painting with a token. */
export function diamond(token: string, size = 11, outline = false): string {
  return `<svg width="${size}" height="${size}" viewBox="${DIAMOND_VIEWBOX}" aria-hidden="true"><polygon points="${DIAMOND_POINTS}" fill="${outline ? "none" : `var(--${token})`}" stroke="var(--${token})" stroke-width="1.5"></polygon></svg>`;
}

export interface VanillaFrameProps {
  body: string;
  height?: number;
  variant?: string;
  title?: string;
}

/** A vanilla page in an iframe that follows the Storybook theme. */
export function VanillaFrame({ body, height = 900, variant, title }: VanillaFrameProps) {
  const theme = useDocumentTheme();
  const srcDoc = useMemo(() => vanillaPage(body, theme, variant, title), [body, theme, variant, title]);
  return (
    <iframe
      title={title ?? "Vanilla CSS sample"}
      srcDoc={srcDoc}
      style={{ width: "100%", height, border: 0, display: "block" }}
    />
  );
}
