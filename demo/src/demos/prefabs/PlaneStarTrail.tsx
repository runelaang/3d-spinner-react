import { Spinner } from "3d-spinner-react";
import { planeStarTrail } from "3d-spinner/prefabs";

export default function PlaneStarTrail({ show }: { show: boolean }) {
  return (
    <Spinner
      show={show}
      type="indeterminate"
      animation={() => planeStarTrail().animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
