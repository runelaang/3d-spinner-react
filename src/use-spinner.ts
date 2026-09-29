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
  /**
   * Play the outro, then stop animating. Keeps the injected element. Resolves
   * once the outro has finished, so `await handle.stop()` before removing the
   * element; resolves at once if the spinner already stopped or is not mounted.
   */
  stop(): Promise<void>;
  /** Stop immediately and remove the injected element. */
  destroy(): void;
}

/**
 * Mount a `3d-spinner` into the element held by `targetRef` and keep it in sync
 * with React state.
 *
 * The spinner is rebuilt whenever a structural option changes (`type`, `loop`,
 * `periodMs`, `timeoutMs`, `until`, `ariaLabel`) or any value in `deps`
 * changes; `deps` is for values captured inside an `animation` factory (a
 * `color` from props, say) that the hook cannot see on its own. `progress` is
 * applied without a rebuild.
 *
 * Prefer an `animation` factory (`() => new SpinAnimation()`) so each (re)mount
 * gets a fresh instance - this is what makes the hook safe under React
 * StrictMode, which mounts, unmounts, then mounts again.
 *
 * Unmounting stops the spinner at once. To play the outro first, `await
 * handle.stop()` (or wait for `onFinish`) and remove the element afterwards.
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

  const { type, loop, periodMs, timeoutMs, ariaLabel } = config;
  const untilTime = config.until?.getTime();

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const current = configRef.current;
    const animation = resolveAnimation(current.animation);
    const spinner = createSpinner(target, buildSpinnerOptions(current, animation));
    spinnerRef.current = spinner;
    let mounted = true;
    void spinner.finished.then(() => {
      if (mounted) configRef.current.onFinish?.();
    });

    return () => {
      mounted = false;
      spinner.destroy();
      spinnerRef.current = null;
    };
    // Rebuild on structural changes and caller-provided deps. `animation` is read
    // from a ref so an inline factory's changing identity does not churn rebuilds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, loop, periodMs, timeoutMs, untilTime, ariaLabel, ...deps]);

  const progress = config.progress;
  useEffect(() => {
    if (type !== "indeterminate" && typeof progress === "number") {
      spinnerRef.current?.setProgress(progress);
    }
  }, [progress, type]);

  return useMemo<SpinnerHandle>(
    () => ({
      setProgress: (target) => spinnerRef.current?.setProgress(target),
      stop: () => {
        const spinner = spinnerRef.current;
        if (!spinner) return Promise.resolve();
        spinner.stop();
        return spinner.finished;
      },
      destroy: () => spinnerRef.current?.destroy(),
    }),
    [],
  );
}
