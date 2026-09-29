import { useState } from "react";
import { Spinner } from "3d-spinner-react";
import { SpinAnimation } from "3d-spinner/animations/spin";
import { octahedron } from "3d-spinner/engines/little-3d-engine";

export default function LoopAndPeriod() {
  const [loop, setLoop] = useState<"bounce" | "restart">("bounce");
  const [periodMs, setPeriodMs] = useState(2000);
  return (
    <>
      <div className="demo-controls">
        <select value={loop} onChange={(event) => setLoop(event.target.value as "bounce" | "restart")}>
          <option value="bounce">bounce</option>
          <option value="restart">restart</option>
        </select>
        <select value={periodMs} onChange={(event) => setPeriodMs(Number(event.target.value))}>
          <option value={3500}>slow</option>
          <option value={2000}>normal</option>
          <option value={1000}>fast</option>
        </select>
      </div>
      <Spinner
        type="indeterminate"
        loop={loop}
        periodMs={periodMs}
        animation={() => new SpinAnimation({ shape: octahedron(), progressAnimation: {} })}
        style={{ width: "100%", height: 240 }}
      />
    </>
  );
}
