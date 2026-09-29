import { Spinner } from "3d-spinner-react";
import { crystalComet } from "3d-spinner/prefabs";

export default function CrystalComet({ show }: { show: boolean }) {
  return (
    <Spinner
      show={show}
      type="indeterminate"
      animation={() => crystalComet({ particles: { rate: 58 } }).animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
