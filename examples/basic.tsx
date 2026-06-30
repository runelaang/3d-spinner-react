// Illustrative usage of 3d-spinner-react. This file is not wired to a bundler;
// it is a reference for dropping the component and hook into your own app.
//
// Animations are imported from `3d-spinner` and injected, so you only pull in
// the ones you use. Pass `animation` as a factory (`() => new ...`) so each
// (re)mount gets a fresh instance - this is what keeps it StrictMode-safe.

import { useRef, useState } from "react";
import { Spinner, useSpinner, type SpinnerHandle } from "3d-spinner-react";
import { SpinAnimation } from "3d-spinner/animations/spin";
import { tetrahedron } from "3d-spinner/engines/little-3d-engine";

// 1. Indeterminate spinner that runs until unmounted.
export function Loading() {
  return (
    <Spinner
      type="indeterminate"
      animation={() => new SpinAnimation({ color: "#3b82f6" })}
      style={{ width: 120, height: 120 }}
    />
  );
}

// 2. Determinate progress driven by React state.
export function Upload({ progress }: { progress: number }) {
  return (
    <Spinner
      progress={progress}
      animation={() => new SpinAnimation({ progressAnimation: {} })}
      style={{ width: 160, height: 160 }}
    />
  );
}

// 3. A factory that captures a prop - list it in `deps` so a color change rebuilds.
export function Themed({ color }: { color: string }) {
  return (
    <Spinner
      type="indeterminate"
      animation={() => new SpinAnimation({ shape: tetrahedron(), color })}
      deps={[color]}
      style={{ width: 120, height: 120 }}
    />
  );
}

// 4. The hook, when you own the container element and want imperative control.
export function ManualControl() {
  const ref = useRef<HTMLDivElement>(null);
  const spinner = useSpinner(ref, {
    animation: () => new SpinAnimation({ progressAnimation: {} }),
  });

  return (
    <div>
      <div ref={ref} style={{ width: 160, height: 160 }} />
      <button onClick={() => spinner.setProgress(1)}>Finish</button>
    </div>
  );
}

// 5. The forwarded ref exposes the same handle from the component.
export function WithHandle() {
  const handleRef = useRef<SpinnerHandle>(null);
  const [progress, setProgress] = useState(0);
  return (
    <div>
      <Spinner
        ref={handleRef}
        progress={progress}
        animation={() => new SpinAnimation({ progressAnimation: {} })}
        style={{ width: 160, height: 160 }}
      />
      <button onClick={() => setProgress((p) => Math.min(1, p + 0.25))}>+25%</button>
      <button onClick={() => handleRef.current?.stop()}>Stop</button>
    </div>
  );
}
