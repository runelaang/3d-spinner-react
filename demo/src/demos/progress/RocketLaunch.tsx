import { Spinner } from "3d-spinner-react";
import { rocketLaunch } from "3d-spinner/prefabs";

export default function RocketLaunch({ show, progress }: { show: boolean; progress: number }) {
  return (
    <Spinner
      show={show}
      progress={progress}
      animation={() => rocketLaunch().animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
