# 3d-spinner-react

[![tests](https://img.shields.io/github/actions/workflow/status/runelaang/3d-spinner-react/ci.yml?label=tests&logo=github)](https://github.com/runelaang/3d-spinner-react/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/3d-spinner-react?logo=npm)](https://www.npmjs.com/package/3d-spinner-react)
[![license](https://img.shields.io/github/license/runelaang/3d-spinner-react)](LICENSE)

React bindings for [`3d-spinner`](https://www.npmjs.com/package/3d-spinner) - a
zero-dependency 3D spinner, loader, and progress indicator that renders to a
canvas. This package is a thin wrapper: a `<Spinner>` component and a
`useSpinner` hook that handle mounting, cleanup, and progress, while you import
the animations you want from `3d-spinner` and pass them in. Nothing you do not
use is pulled in.

## Install

```sh
npm install 3d-spinner-react 3d-spinner react
```

`3d-spinner` and `react` (18+) are peer dependencies.

## Quick start

An indeterminate spinner that runs until it unmounts. Give the host a size - the
spinner sizes its canvas to fill it.

```tsx
import { Spinner } from "3d-spinner-react";
import { SpinAnimation } from "3d-spinner/animations/spin";

function Loading() {
  return (
    <Spinner
      type="indeterminate"
      animation={() => new SpinAnimation({ color: "#3b82f6" })}
      style={{ width: 120, height: 120 }}
    />
  );
}
```

> **Pass `animation` as a factory** (`() => new SpinAnimation()`), not a bare
> instance. A fresh instance is built on every (re)mount, which is what makes the
> component safe under React StrictMode and when structural props change. A bare
> instance works but is destroyed on unmount and cannot be reused.

## Reporting progress

Drop `type` (it defaults to `"progress"`) and drive `progress` from state.
Updates are applied with `setProgress` without rebuilding the spinner; reaching
`1` plays the outro. Give `SpinAnimation` a `progressAnimation` to make it pop in
and scale with progress.

```tsx
import { useState } from "react";
import { Spinner } from "3d-spinner-react";
import { SpinAnimation } from "3d-spinner/animations/spin";

function Upload() {
  const [progress, setProgress] = useState(0);
  return (
    <Spinner
      progress={progress}
      animation={() => new SpinAnimation({ progressAnimation: {} })}
      style={{ width: 160, height: 160 }}
    />
  );
}
```

## Choosing a shape or animation

The wrapper never imports the engine, so import shapes and animations directly
from `3d-spinner` and inject them. If your factory captures a prop or piece of
state, list it in `deps` so the spinner rebuilds when it changes.

```tsx
import { Spinner } from "3d-spinner-react";
import { SpinAnimation } from "3d-spinner/animations/spin";
import { tetrahedron } from "3d-spinner/engines/little-3d-engine";

function Themed({ color }: { color: string }) {
  return (
    <Spinner
      type="indeterminate"
      animation={() => new SpinAnimation({ shape: tetrahedron(), color })}
      deps={[color]}
      style={{ width: 120, height: 120 }}
    />
  );
}
```

See [`3d-spinner`'s docs](https://www.npmjs.com/package/3d-spinner) for the full
set of animations (`SpinAnimation`, `ObjectMotionAnimation`, `ChargedOrbAnimation`,
`GridAssemblyAnimation`, `ParticlesAnimation`), shapes, motion
paths, and rendering backends.

## The `useSpinner` hook

When you want to own the container element or drive the spinner imperatively, use
the hook. It returns a stable handle.

```tsx
import { useRef } from "react";
import { useSpinner } from "3d-spinner-react";
import { SpinAnimation } from "3d-spinner/animations/spin";

function ManualControl() {
  const ref = useRef<HTMLDivElement>(null);
  const spinner = useSpinner(ref, {
    animation: () => new SpinAnimation({ progressAnimation: {} }),
  });

  return (
    <>
      <div ref={ref} style={{ width: 160, height: 160 }} />
      <button onClick={() => spinner.setProgress(1)}>Finish</button>
    </>
  );
}
```

The `<Spinner>` component forwards a ref to the same handle:

```tsx
const ref = useRef<SpinnerHandle>(null);
<Spinner ref={ref} animation={() => new SpinAnimation()} /* ... */ />;
ref.current?.stop();
```

## API

### `<Spinner>`

A `div` that hosts the spinner. Accepts every spinner option below plus any
standard `div` attribute (`className`, `style`, `aria-*`, ...). The host div
defaults to `position: relative` and **must have a size** - a zero-height div
renders nothing.

### `useSpinner(targetRef, config, deps?)`

Mounts a spinner into `targetRef.current` and keeps it in sync. Returns a
`SpinnerHandle`.

### Options (`SpinnerConfig`)

| Option | Type | Description |
| --- | --- | --- |
| `animation` | `SpinnerAnimation \| () => SpinnerAnimation` | The visual to play. Prefer a factory. Required. |
| `type` | `"progress" \| "indeterminate"` | Mode. Default `"progress"`. |
| `progress` | `number` | Progress `0..1` (progress mode). Reactive. |
| `timeout` | `number` | Auto-complete after this many ms (progress mode). |
| `until` | `Date` | Auto-complete at this time (progress mode). |
| `loop` | `"bounce" \| "restart"` | Loop style (indeterminate mode). Default `"bounce"`. |
| `periodMs` | `number` | Ms for one sweep (indeterminate mode). Default `2000`. |
| `deps` | `DependencyList` | Extra rebuild triggers for values captured in an `animation` factory. Default `[]`. |

Structural options (`type`, `loop`, `periodMs`, `timeout`, `until`) rebuild the
spinner automatically when they change. `progress` is applied without a rebuild.

### `SpinnerHandle`

| Method | Description |
| --- | --- |
| `setProgress(target)` | Advance progress toward `target` (`0..1`). No-op when indeterminate. |
| `stop()` | Play the outro, then stop. Keeps the element. |
| `destroy()` | Stop now and remove the element. Called automatically on unmount. |

## Requirements

React 18+. The spinner renders to a canvas, so it runs in the browser only -
there is no server-side rendering. Effects (and therefore mounting) run on the
client after hydration.

The entry is marked `"use client"`, so you can import `<Spinner>` directly into a
Next.js App Router (React Server Components) tree without wrapping it yourself.

## Development

```sh
npm install
npm run build      # compile src/ to dist/ (ESM + type declarations)
npm run typecheck  # type-check without emitting
npm test           # build, then run the unit tests
```

## License

MIT (c) RuneL
