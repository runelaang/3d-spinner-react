"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type DependencyList,
  type ForwardedRef,
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
  /**
   * Whether the spinner is shown. Default `true`. Turning it `false` plays the
   * outro, then removes the host div (`onFinish` runs just before). Turning it
   * `true` again mounts a fresh spinner with its intro. Unmounting the component
   * instead stops the spinner at once, without an outro.
   */
  show?: boolean;
}

const BASE_STYLE: CSSProperties = { position: "relative" };

/**
 * A div that hosts a `3d-spinner`. Forwarded ref exposes a {@link SpinnerHandle}
 * (`setProgress` / `stop` / `destroy`).
 *
 * The host div must have a size - the spinner sizes its canvas to fill it, so a
 * zero-height div renders nothing. Give it a height via `style` or `className`.
 *
 * Control visibility with `show` rather than conditional rendering to let the
 * outro play before the div is removed.
 *
 * ```tsx
 * <Spinner
 *   show={loading}
 *   type="indeterminate"
 *   animation={() => new SpinAnimation({ color: "#3b82f6" })}
 *   style={{ width: 120, height: 120 }}
 * />
 * ```
 */
export const Spinner = forwardRef<SpinnerHandle, SpinnerProps>(function Spinner(
  { show = true, ...props },
  ref,
) {
  const [presence, setPresence] = useState({ show, mounted: show, generation: 0 });
  // Adjust state while rendering when `show` changes (React's pattern for state derived
  // from a prop), so a re-shown spinner remounts in this render rather than the next one.
  if (presence.show !== show) {
    setPresence({
      show,
      mounted: show || presence.mounted,
      generation: show ? presence.generation + 1 : presence.generation,
    });
  }
  const removeAfterOutro = useCallback(
    () => setPresence((current) => (current.show ? current : { ...current, mounted: false })),
    [],
  );

  if (!presence.mounted) return null;
  return (
    <SpinnerHost
      key={presence.generation}
      {...props}
      show={show}
      handleRef={ref}
      onOutroDone={removeAfterOutro}
    />
  );
});

interface SpinnerHostProps extends Omit<SpinnerProps, "show"> {
  show: boolean;
  handleRef: ForwardedRef<SpinnerHandle>;
  onOutroDone: () => void;
}

/** The host div and its spinner; plays the outro and reports back when `show` turns false. */
function SpinnerHost({
  show,
  handleRef,
  onOutroDone,
  animation,
  type,
  progress,
  timeoutMs,
  until,
  loop,
  periodMs,
  ariaLabel,
  onFinish,
  deps = [],
  style,
  ...rest
}: SpinnerHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handle = useSpinner(
    containerRef,
    { animation, type, progress, timeoutMs, until, loop, periodMs, ariaLabel, onFinish },
    deps,
  );
  useImperativeHandle(handleRef, () => handle, [handle]);

  useEffect(() => {
    if (show) return;
    let current = true;
    void handle.stop().then(() => {
      if (current) onOutroDone();
    });
    return () => {
      current = false;
    };
  }, [show, handle, onOutroDone]);

  return <div ref={containerRef} style={{ ...BASE_STYLE, ...style }} {...rest} />;
}
