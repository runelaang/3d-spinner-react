import { Spinner } from "3d-spinner-react";
import { SpinAnimation } from "3d-spinner/animations/spin";

export default function AutoComplete() {
  return (
    <Spinner
      progress={0.05}
      timeoutMs={4000}
      animation={() => new SpinAnimation({ color: "#16a34a", progressAnimation: {} })}
      style={{ width: "100%", height: 240 }}
    />
  );
}
