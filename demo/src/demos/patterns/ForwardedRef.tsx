import { useRef } from "react";
import { Spinner, type SpinnerHandle } from "3d-spinner-react";
import { chargedOrb } from "3d-spinner/prefabs";

export default function ForwardedRef() {
  const spinner = useRef<SpinnerHandle>(null);
  return (
    <>
      <div className="demo-controls">
        {[0.25, 0.5, 0.75, 1].map((value) => (
          <button key={value} onClick={() => spinner.current?.setProgress(value)}>
            {value * 100}%
          </button>
        ))}
        <button onClick={() => spinner.current?.stop()}>Stop</button>
      </div>
      <Spinner
        ref={spinner}
        progress={0.05}
        animation={() => chargedOrb().animation}
        style={{ width: "100%", height: 240 }}
      />
    </>
  );
}
