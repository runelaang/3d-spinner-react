import { Spinner } from "3d-spinner-react";
import { crystalComet } from "3d-spinner/prefabs";

export default function CrystalComet() {
  return (
    <Spinner
      type="indeterminate"
      animation={() => crystalComet({ particles: { rate: 58 } }).animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
