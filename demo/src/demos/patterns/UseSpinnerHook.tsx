import { useRef } from "react";
import { useSpinner } from "3d-spinner-react";
import { planeStarTrail } from "3d-spinner/prefabs";

export default function UseSpinnerHook() {
  const ref = useRef<HTMLDivElement>(null);
  const spinner = useSpinner(ref, {
    type: "indeterminate",
    animation: () => planeStarTrail().animation,
  });

  return (
    <>
      <div className="demo-controls">
        <button onClick={() => spinner.stop()}>Stop (plays the outro)</button>
      </div>
      <div ref={ref} style={{ position: "relative", width: "100%", height: 240 }} />
    </>
  );
}
