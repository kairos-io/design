import { useCallback, type ForwardedRef, type MutableRefObject, type RefCallback } from "react";

function setRef<T>(ref: ForwardedRef<T> | MutableRefObject<T | null> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

/**
 * One ref callback that feeds a node to two refs: the one the component
 * keeps for itself (to scroll, measure or test containment) and the one a
 * parent forwarded. Callback refs are called, object refs are assigned, and
 * a missing ref is skipped.
 */
export function useMergedRef<T>(
  inner: MutableRefObject<T | null>,
  forwarded: ForwardedRef<T> | undefined,
): RefCallback<T> {
  return useCallback(
    (node: T | null) => {
      setRef(inner, node);
      setRef(forwarded, node);
    },
    [inner, forwarded],
  );
}
