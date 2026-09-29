import type { SpinnerAnimation, SpinnerOptions } from "3d-spinner";

/** An animation instance, or a factory that builds a fresh one each time it is called. */
export type AnimationSource = SpinnerAnimation | (() => SpinnerAnimation);

/**
 * The declarative configuration shared by {@link useSpinner} and the `Spinner`
 * component. It mirrors the options of `createSpinner` from `3d-spinner`, with
 * `animation` widened to also accept a factory.
 */
export interface SpinnerConfig {
  /**
   * The visual to play. Prefer a **factory** (`() => new SpinAnimation()`): a
   * fresh instance is built on every (re)mount, which is required for React
   * StrictMode and for structural prop changes. A bare instance is supported
   * but is destroyed on unmount and cannot be reused: `3d-spinner` throws when
   * the same instance is mounted a second time.
   */
  animation: AnimationSource;
  /** Spinner mode. `"progress"` (default) is caller-driven; `"indeterminate"` self-drives. */
  type?: "progress" | "indeterminate";
  /** Progress `0..1` for a `progress` spinner. Reactive: updates call `setProgress`. */
  progress?: number;
  /** Auto-complete a `progress` spinner after this many milliseconds. */
  timeoutMs?: number;
  /** Auto-complete a `progress` spinner at this time. If both are set, the earlier wins. */
  until?: Date;
  /** `"bounce"` (default) or `"restart"` loop style for an `indeterminate` spinner. */
  loop?: "bounce" | "restart";
  /** Milliseconds for one sweep of an `indeterminate` spinner. Default `2000`. */
  periodMs?: number;
  /** Accessible name of the spinner's progress bar for assistive technology. Default `"Loading"`. */
  ariaLabel?: string;
  /**
   * Called when the spinner stops animating while it is still mounted: its outro
   * finished (after `stop()`, progress reaching 1, `timeoutMs`, `until`, or
   * `show` turning `false`), it was stopped before its intro, or it could not
   * start. Not called when the spinner is unmounted or rebuilt.
   */
  onFinish?: () => void;
}

/** Resolve an {@link AnimationSource} to a concrete instance, calling the factory if given one. */
export function resolveAnimation(source: AnimationSource): SpinnerAnimation {
  return typeof source === "function" ? source() : source;
}

/**
 * Build the `SpinnerOptions` passed to `createSpinner` from a {@link SpinnerConfig}
 * and a resolved animation instance. Only the fields relevant to the chosen mode
 * are included, so progress-only options never leak into an indeterminate spinner
 * (or vice versa). Pure: no side effects, safe to unit-test.
 */
export function buildSpinnerOptions(
  config: SpinnerConfig,
  animation: SpinnerAnimation,
): SpinnerOptions {
  if (config.type === "indeterminate") {
    const options: SpinnerOptions = { type: "indeterminate", animation };
    if (config.loop !== undefined) options.loop = config.loop;
    if (config.periodMs !== undefined) options.periodMs = config.periodMs;
    if (config.ariaLabel !== undefined) options.ariaLabel = config.ariaLabel;
    return options;
  }
  const options: SpinnerOptions = { type: "progress", animation };
  if (config.progress !== undefined) options.progress = config.progress;
  if (config.timeoutMs !== undefined) options.timeoutMs = config.timeoutMs;
  if (config.until !== undefined) options.until = config.until;
  if (config.ariaLabel !== undefined) options.ariaLabel = config.ariaLabel;
  return options;
}
