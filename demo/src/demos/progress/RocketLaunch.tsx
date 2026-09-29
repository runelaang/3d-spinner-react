import { Spinner } from "3d-spinner-react";
import { rocketLaunch } from "3d-spinner/prefabs";

export default function RocketLaunch({ progress }: { progress: number }) {
  return (
    <Spinner
      progress={progress}
      animation={() => rocketLaunch().animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
