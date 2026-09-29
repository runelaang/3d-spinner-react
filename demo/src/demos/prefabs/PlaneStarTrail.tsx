import { Spinner } from "3d-spinner-react";
import { planeStarTrail } from "3d-spinner/prefabs";

export default function PlaneStarTrail() {
  return (
    <Spinner
      type="indeterminate"
      animation={() => planeStarTrail().animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
