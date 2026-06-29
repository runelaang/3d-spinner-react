"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type DependencyList,
  type HTMLAttributes,
} from "react";
import { useSpinner, type SpinnerHandle } from "./use-spinner.js";
import type { SpinnerConfig } from "./options.js";

/** Props for the {@link Spinner} component: a {@link SpinnerConfig} plus div attributes. */
export interface SpinnerProps
  extends SpinnerConfig,
    Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Extra dependencies that trigger a rebuild, for values captured inside an
   * `animation` factory. Structural options rebuild automatically. Default `[]`.
   */
  deps?: DependencyList;
}

const BASE_STYLE: CSSProperties = { position: "relative" };

/**
 * A div that hosts a `3d-spinner`. Forwarded ref exposes a {@link SpinnerHandle}
 * (`setProgress` / `stop` / `destroy`).
 *
 * The host div must have a size - the spinner sizes its canvas to fill it, so a
 * zero-height div renders nothing. Give it a height via `style` or `className`.
 *
 * ```tsx
 * <Spinner
 *   type="indeterminate"
 *   animation={() => new SpinAnimation({ color: "#3b82f6" })}
 *   style={{ width: 120, height: 120 }}
 * />
 * ```
 */
export const Spinner = forwardRef<SpinnerHandle, SpinnerProps>(function Spinner(props, ref) {
  const {
    animation,
    type,
    progress,
    timeout,
    until,
    loop,
    periodMs,
    deps = [],
    style,
    ...rest
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const handle = useSpinner(
    containerRef,
    { animation, type, progress, timeout, until, loop, periodMs },
    deps,
  );
  useImperativeHandle(ref, () => handle, [handle]);

  return <div ref={containerRef} style={{ ...BASE_STYLE, ...style }} {...rest} />;
});
