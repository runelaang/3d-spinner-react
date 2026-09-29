import { useState } from "react";
import { Spinner } from "3d-spinner-react";
import { SpinAnimation } from "3d-spinner/animations/spin";

export default function ProgressFromState() {
  const [percent, setPercent] = useState(0);
  return (
    <>
      <div className="demo-controls">
        <input
          type="range"
          min={0}
          max={100}
          value={percent}
          onChange={(event) => setPercent(Number(event.target.value))}
        />
        <output>{percent}%</output>
      </div>
      <Spinner
        progress={percent / 100}
        animation={() => new SpinAnimation({ progressAnimation: {} })}
        style={{ width: "100%", height: 240 }}
      />
    </>
  );
}
