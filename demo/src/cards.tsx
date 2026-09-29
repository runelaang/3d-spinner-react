import { useEffect, useState } from "react";
import type { Demo } from "./catalog";

const PLAY_MS = 10000;

/** Which card is mounted right now; `run` changes on every Play so a replay remounts. */
export interface Live {
  id: string;
  run: number;
}

interface CardProps {
  demo: Demo;
  live: Live | null;
  play: (id: string) => void;
  stop: () => void;
}

/** Card for a self-contained demo: the first button mounts the component, the second unmounts it. */
export function DemoCard({
  demo,
  live,
  play,
  stop,
  labels = ["Play", "Stop"],
  controls = false,
}: CardProps & { labels?: [string, string]; controls?: boolean }) {
  const playing = live?.id === demo.id;
  return (
    <section className="spinner-card">
      <h2>
        {demo.title}
        <span className="card-playback">
          <button type="button" className="card-start" onClick={() => play(demo.id)}>
            {labels[0]}
          </button>
          <button type="button" className="card-stop" onClick={() => playing && stop()}>
            {labels[1]}
          </button>
        </span>
      </h2>
      <div className={controls ? "stage demo-stage" : "stage"}>
        {playing ? <demo.Component key={live.run} /> : <Hint text={`Press ${labels[0]}`} />}
      </div>
      {demo.note && <p className="card-story">{demo.note}</p>}
      <pre className="config">{demo.source}</pre>
    </section>
  );
}

/** Card for a progress demo: Play runs the story over ten seconds, the slider takes over. */
export function ProgressCard({ demo, live, play }: CardProps) {
  const playing = live?.id === demo.id;
  const run = playing ? live.run : 0;
  const [percent, setPercent] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
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
      <div className="stage">
        {playing ? (
          <demo.Component key={run} progress={percent / 100} />
        ) : (
          <Hint text="Press Play" />
        )}
      </div>
      {demo.note && <p className="card-story">{demo.note}</p>}
      <pre className="config">{demo.source}</pre>
    </section>
  );
}

/** Placeholder shown in an empty stage. */
function Hint({ text }: { text: string }) {
  return <span className="stage-hint">{text}</span>;
}
