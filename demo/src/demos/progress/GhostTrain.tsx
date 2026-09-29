import { Spinner } from "3d-spinner-react";
import { ghostTrain } from "3d-spinner/prefabs";

export default function GhostTrain({ progress }: { progress: number }) {
  return (
    <Spinner
      progress={progress}
      animation={() => ghostTrain().animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
