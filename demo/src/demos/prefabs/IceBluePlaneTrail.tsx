import { Spinner } from "3d-spinner-react";
import { planeStarTrail } from "3d-spinner/prefabs";

export default function IceBluePlaneTrail({ show }: { show: boolean }) {
  return (
    <Spinner
      show={show}
      type="indeterminate"
      periodMs={3200}
      animation={() =>
        planeStarTrail({
          particles: {
            colors: ["#fff", "#a5f3fc", "#60a5fa"],
            rate: 52,
            lifeMs: 2600,
          },
        }).animation
      }
      style={{ width: "100%", height: "100%" }}
    />
  );
}
