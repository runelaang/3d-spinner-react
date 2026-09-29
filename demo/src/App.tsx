import { useEffect, useState } from "react";
import { MountCard, ProgressCard, ShowCard, type CardState } from "./cards";
import { PATTERNS, PREFABS, PROGRESS_PREFABS } from "./catalog";
import { useTheme } from "./theme";

const ENGINE_DEMO = "https://runelaang.github.io/3d-spinner/";

const PAGES = [
  { id: "progress", label: "Progress prefabs" },
  { id: "prefabs", label: "Prefabs" },
  { id: "patterns", label: "React patterns" },
] as const;
type PageId = (typeof PAGES)[number]["id"];

/** The page named by the URL hash, defaulting to the progress prefabs. */
function pageFromHash(): PageId {
  return PAGES.find((page) => `#${page.id}` === location.hash)?.id ?? "progress";
}

/** The current page, kept in sync with the URL hash. */
function usePage() {
  const [page, setPage] = useState(pageFromHash);
  useEffect(() => {
    const onChange = () => setPage(pageFromHash());
    addEventListener("hashchange", onChange);
    return () => removeEventListener("hashchange", onChange);
  }, []);
  return page;
}

/** The demo site: a top bar and one page of demo cards, one of which runs at a time. */
export function App() {
  const page = usePage();
  const theme = useTheme();
  const [live, setLive] = useState<string | null>(null);
  const [runs, setRuns] = useState<Record<string, number>>({});
  const play = (id: string) => {
    setLive(id);
    setRuns((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  };
  const stop = () => setLive(null);
  const cards: CardState = { live, runs, play, stop };

  useEffect(() => setLive(null), [page]);

  return (
    <>
      <nav className="topbar">
        {PAGES.map(({ id, label }) => (
          <a key={id} href={`#${id}`} className={id === page ? "active" : undefined}>
            {label}
          </a>
        ))}
        <a href={ENGINE_DEMO}>3d-spinner demo</a>
        <button
          type="button"
          className="theme-toggle"
          title={`Color scheme: ${theme.mode}`}
          onClick={theme.next}
        >
          {theme.mode[0].toUpperCase() + theme.mode.slice(1)}
        </button>
      </nav>

      {page === "progress" && (
        <>
          <h1>3d-spinner-react: progress prefabs</h1>
          <p className="note">
            Progress prefabs tell a small story: an intro as loading starts, a scene that evolves
            with the progress you report, and a finale at 100%. In React you pass{" "}
            <code>progress</code> as a prop; each change calls <code>setProgress</code> without
            rebuilding the spinner. Play runs the story over ten seconds; grab the slider at any
            time to take over. The code under each card is the complete component it runs.
          </p>
          <div className="spinner-grid prefab-grid">
            {PROGRESS_PREFABS.map((demo) => (
              <ProgressCard key={demo.id} demo={demo} {...cards} />
            ))}
          </div>
        </>
      )}

      {page === "prefabs" && (
        <>
          <h1>3d-spinner-react: prefabs</h1>
          <p className="note">
            Each prefab comes with a complete animation. Pass its <code>animation</code> to{" "}
            <code>&lt;Spinner&gt;</code> as a factory; spinner options such as{" "}
            <code>periodMs</code> and <code>loop</code> go on <code>&lt;Spinner&gt;</code> itself.
            Stop sets <code>show</code> to <code>false</code>: the outro plays, then the spinner
            removes itself. One card plays at a time; starting another one hides the current one.
          </p>
          <div className="spinner-grid prefab-grid">
            {PREFABS.map((demo) => (
              <ShowCard key={demo.id} demo={demo} {...cards} />
            ))}
          </div>
        </>
      )}

      {page === "patterns" && (
        <>
          <h1>3d-spinner-react: React patterns</h1>
          <p className="note">
            Everyday React usage: progress from state, props that rebuild the spinner, showing a
            spinner while loading, and the imperative handle. Unmount on these cards removes the
            component at once, like any unmount; the first card compares that with
            <code>show</code>, which plays the outro first. Shapes, shading, motion paths, and particles
            are shown in the <a href={ENGINE_DEMO}>3d-spinner demo</a>; in React only the line
            that mounts the spinner differs.
          </p>
          <div className="spinner-grid">
            {PATTERNS.map((demo) => (
              <MountCard key={demo.id} demo={demo} {...cards} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
