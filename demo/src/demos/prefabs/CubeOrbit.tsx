import { Spinner } from "3d-spinner-react";
import { cube } from "3d-spinner/engines/little-3d-engine";
import { circleMotion } from "3d-spinner/motion";
import { crystalComet } from "3d-spinner/prefabs";

export default function CubeOrbit() {
  return (
    <Spinner
      type="indeterminate"
      animation={() =>
        crystalComet({
          object: {
            mesh: cube,
            motion: circleMotion({ radius: 0.72 }),
          },
        }).animation
      }
      style={{ width: "100%", height: "100%" }}
    />
  );
}
