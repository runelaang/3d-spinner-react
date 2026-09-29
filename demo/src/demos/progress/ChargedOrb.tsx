import { Spinner } from "3d-spinner-react";
import { chargedOrb } from "3d-spinner/prefabs";

export default function ChargedOrb({ progress }: { progress: number }) {
  return (
    <Spinner
      progress={progress}
      animation={() => chargedOrb().animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
