import { useEffect, useState } from "react";
import type { Demo } from "./catalog";

const PLAY_MS = 10000;

/** What every card gets from the page: which card is live and how often each was played. */
export interface CardState {
  live: string | null;
  runs: Record<string, number>;
  play: (id: string) => void;
  stop: () => void;
}

/**
 * Card for a spinner demo that takes a `show` prop: Play shows it, Stop sets `show` to
 * false so the outro plays before the spinner removes itself. Playing again restarts it.
 */
export function ShowCard({ demo, live, runs, play, stop }: CardState & { demo: Demo }) {
  const playing = live === demo.id;
  return (
    <section className="spinner-card">
      <h2>
        {demo.title}
        <span className="card-playback">
          <button type="button" className="card-start" onClick={() => play(demo.id)}>
            Play
          </button>
          <button type="button" className="card-stop" onClick={() => playing && stop()}>
            Stop
          </button>
        </span>
      </h2>
      <div className="stage" data-hint="Press Play">
        <demo.Component key={runs[demo.id] ?? 0} show={playing} />
      </div>
      {demo.note && <p className="card-story">{demo.note}</p>}
      <pre className="config">{demo.source}</pre>
    </section>
  );
}

/** Card for a self-contained demo: Mount renders the component, Unmount removes it at once. */
export function MountCard({ demo, live, runs, play, stop }: CardState & { demo: Demo }) {
  const playing = live === demo.id;
  return (
    <section className="spinner-card">
      <h2>
        {demo.title}
        <span className="card-playback">
          <button type="button" className="card-start" onClick={() => play(demo.id)}>
            Mount
          </button>
          <button type="button" className="card-stop" onClick={() => playing && stop()}>
            Unmount
          </button>
        </span>
      </h2>
      <div className="stage demo-stage" data-hint="Press Mount">
        {playing && <demo.Component key={runs[demo.id]} />}
      </div>
      {demo.note && <p className="card-story">{demo.note}</p>}
      <pre className="config">{demo.source}</pre>
    </section>
  );
}

/**
 * Card for a progress demo: Play runs the story over ten seconds and the slider takes over.
 * Playing another card hides this one, which plays its outro.
 */
export function ProgressCard({ demo, live, runs, play }: CardState & { demo: Demo }) {
  const playing = live === demo.id;
  const run = runs[demo.id] ?? 0;
  const [percent, setPercent] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!run) return;
    setPercent(0);
    setManual(false);
  }, [run]);

  useEffect(() => {
    if (!playing || manual) return;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const value = Math.min(100, Math.round(((now - start) / PLAY_MS) * 100));
      setPercent(value);
      if (value < 100) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, manual, run]);

  return (
    <section className="spinner-card">
      <h2>
        {demo.title}
        <span className="card-playback">
          <button type="button" className="card-start" onClick={() => play(demo.id)}>
            Play
          </button>
        </span>
      </h2>
      <div className="card-progress">
        <span>Progress</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={percent}
          disabled={!playing}
          onChange={(event) => {
            setManual(true);
            setPercent(Number(event.target.value));
          }}
        />
        <output>{percent}%</output>
      </div>
      <div className="stage" data-hint="Press Play">
        <demo.Component key={run} show={playing} progress={percent / 100} />
      </div>
      {demo.note && <p className="card-story">{demo.note}</p>}
      <pre className="config">{demo.source}</pre>
    </section>
  );
}
