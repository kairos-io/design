// The focus indicator, as the Foundations deck draws it: 2px of ink around
// the focused control, only for keyboard focus. Written out in full so
// Tailwind finds every class in the source.

/** The ring drawn as a box shadow on the control's edge: links, list rows, icon buttons. */
export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink";

/** The ring held 2px off the edge, for a control on a fill of its own: a chip, a switch, a card. */
export const focusRingOffset =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2";

/** The ring drawn as an outline 2px off the edge: buttons, tabs, native inputs. */
export const focusOutline =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
