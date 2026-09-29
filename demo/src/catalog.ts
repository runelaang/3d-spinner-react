import type { ComponentType } from "react";

type AnyComponent = ComponentType<any>;

const components = import.meta.glob<AnyComponent>("./demos/**/*.tsx", {
  eager: true,
  import: "default",
});
const sources = import.meta.glob<string>("./demos/**/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
});

/** One demo card: the component it runs and that component's own source. */
export interface Demo {
  id: string;
  title: string;
  note?: string;
  Component: AnyComponent;
  source: string;
}

/** Look up the demo component in `demos/<file>.tsx` together with its source text. */
function demo(file: string, title: string, note?: string): Demo {
  const path = `./demos/${file}.tsx`;
  const Component = components[path];
  if (!Component) throw new Error(`Demo file not found: ${path}`);
  return { id: file, title, note, Component, source: sources[path].trim() };
}

export const PROGRESS_PREFABS: Demo[] = [
  demo(
    "progress/GridAssembly",
    "Grid assembly",
    "25 pastel dark-blue cubes circle the view edge, completing the full ring before any move; then they dock one by one into a 5x5 grid as progress climbs, hold for a beat at 100%, and dive into the center a little staggered before popping away.",
  ),
  demo(
    "progress/ChargedOrb",
    "Charged orb",
    "The center orb pops straight to full size; every 10% a mini orb pops out of it into an evenly spread satellite ring, each with its own spark stream. At 100% the satellites take one extra lap, dive back into the orb, and it pops away.",
  ),
  demo(
    "progress/RocketLaunch",
    "Rocket launch",
    "Every 5% a small rocket slides in from the right and lines up under the counter, idling on a wisp of smoke. At 100% the whole row blasts off in a loose stagger on columns of fire; partway up, three of them veer 30-50 degrees and streak away.",
  ),
  demo(
    "progress/GhostTrain",
    "Ghost train",
    "A translucent train of ice cubes laps a tilted track, turning smoothly through the corners and shedding glowing stars. Every 2% attaches one more car, popping it in at the tail; at 100% the lead keeps going in its current direction and every car funnels through that same exit along the exact same path, accelerating clear of the view within four seconds.",
  ),
];

export const PREFABS: Demo[] = [
  demo("prefabs/PlaneStarTrail", "Plane star trail"),
  demo("prefabs/CrystalComet", "Crystal comet"),
  demo("prefabs/PulsingStarfield", "Pulsing starfield"),
  demo("prefabs/StarSwarmCustomHtml", "Star swarm with custom HTML"),
  demo("prefabs/IceBluePlaneTrail", "Ice blue plane trail"),
  demo("prefabs/CubeOrbit", "Cube orbit"),
  demo("prefabs/StarFountain", "Star fountain"),
  demo("prefabs/SquareStarPatrol", "Square star patrol"),
  demo("prefabs/MonochromeStreak", "Monochrome streak"),
];

export const PATTERNS: Demo[] = [
  demo(
    "patterns/ShowVersusUnmount",
    "show versus unmount",
    "Both spinners stop when loading finishes. The left one is rendered conditionally and vanishes at once. The right one uses show: it plays its outro, calls onFinish, then removes itself.",
  ),
  demo(
    "patterns/ProgressFromState",
    "Progress from state",
    "Drag the slider. A new progress prop calls setProgress without rebuilding the spinner. At 100% the outro plays and the spinner stops; mount it again to start over.",
  ),
  demo(
    "patterns/LoopAndPeriod",
    "Loop and speed",
    'type="indeterminate" runs on its own. Changing loop or periodMs rebuilds the spinner automatically.',
  ),
  demo(
    "patterns/AutoComplete",
    "Auto-complete with timeoutMs",
    "The spinner drives itself to 100% after four seconds and plays its outro.",
  ),
  demo(
    "patterns/WhileLoading",
    "Show while loading",
    "show={loading} shows the spinner while the request runs. When it ends, the outro plays and the spinner removes itself.",
  ),
  demo(
    "patterns/RebuildWithDeps",
    "Rebuild with deps",
    "The animation factory reads color, which the component cannot see on its own, so color goes in deps.",
  ),
  demo(
    "patterns/UseSpinnerHook",
    "useSpinner hook",
    "Mount into your own element and control it through the returned handle. Give the element position: relative so labels sit on top of the canvas.",
  ),
  demo(
    "patterns/ForwardedRef",
    "Handle through a ref",
    "<Spinner ref> gives the same handle as the hook: report progress from code, or stop.",
  ),
];
