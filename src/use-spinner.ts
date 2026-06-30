"use client";

import { useEffect, useMemo, useRef, type DependencyList, type RefObject } from "react";
import { createSpinner, type Spinner } from "3d-spinner";
import {
  buildSpinnerOptions,
  resolveAnimation,
  type SpinnerConfig,
} from "./options.js";

/** Imperative controls for a mounted spinner, stable for the lifetime of the hook. */
export interface SpinnerHandle {
  /** Advance progress toward `target` (`0..1`). No-op for an indeterminate spinner. */
  setProgress(target: number): void;
  /** Play the outro, then stop animating. Keeps the injected element. */
  stop(): void;
  /** Stop immediately and remove the injected element. */
  destroy(): void;
}

/**
 * Mount a `3d-spinner` into the element held by `targetRef` and keep it in sync
 * with React state.
 *
 * The spinner is rebuilt whenever a structural option changes (`type`, `loop`,
 * `periodMs`, `timeout`, `until`) or any value in `deps` changes; `deps` is for
 * values captured inside an `animation` factory (a `color` from props, say) that
 * the hook cannot see on its own. `progress` is applied without a rebuild.
 *
 * Prefer an `animation` factory (`() => new SpinAnimation()`) so each (re)mount
 * gets a fresh instance - this is what makes the hook safe under React
 * StrictMode, which mounts, unmounts, then mounts again.
 *
 * @param targetRef Ref to the element the spinner mounts into.
 * @param config Declarative spinner configuration.
 * @param deps Extra dependencies that should trigger a rebuild (default `[]`).
 * @returns Stable imperative {@link SpinnerHandle}.
 */
export function useSpinner<T extends HTMLElement>(
  targetRef: RefObject<T | null>,
  config: SpinnerConfig,
  deps: DependencyList = [],
): SpinnerHandle {
  const configRef = useRef(config);
  configRef.current = config;

  const spinnerRef = useRef<Spinner | null>(null);

  const { type, loop, periodMs, timeout } = config;
  const untilTime = config.until?.getTime();

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const current = configRef.current;
    const animation = resolveAnimation(current.animation);
    const spinner = createSpinner(target, buildSpinnerOptions(current, animation));
    spinnerRef.current = spinner;

    return () => {
      spinner.destroy();
      spinnerRef.current = null;
    };
    // Rebuild on structural changes and caller-provided deps. `animation` is read
    // from a ref so an inline factory's changing identity does not churn rebuilds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, loop, periodMs, timeout, untilTime, ...deps]);

  const progress = config.progress;
  useEffect(() => {
    if (type !== "indeterminate" && typeof progress === "number") {
      spinnerRef.current?.setProgress(progress);
    }
  }, [progress, type]);

  return useMemo<SpinnerHandle>(
    () => ({
      setProgress: (target) => spinnerRef.current?.setProgress(target),
      stop: () => spinnerRef.current?.stop(),
      destroy: () => spinnerRef.current?.destroy(),
    }),
    [],
  );
}
