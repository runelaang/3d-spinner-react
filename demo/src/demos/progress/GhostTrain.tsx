import { Spinner } from "3d-spinner-react";
import { ghostTrain } from "3d-spinner/prefabs";

export default function GhostTrain({ show, progress }: { show: boolean; progress: number }) {
  return (
    <Spinner
      show={show}
      progress={progress}
      animation={() => ghostTrain().animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
