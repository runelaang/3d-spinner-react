import { Spinner } from "3d-spinner-react";
import { pulsingStarfield } from "3d-spinner/prefabs";

export default function StarFountain() {
  return (
    <Spinner
      type="indeterminate"
      animation={() =>
        pulsingStarfield({
          label: "Preparing launch",
          particles: {
            direction: { x: 0, y: 1, z: 0 },
            gravity: { x: 0, y: -0.35, z: 0 },
          },
        }).animation
      }
      style={{ width: "100%", height: "100%" }}
    />
  );
}
