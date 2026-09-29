import { Spinner } from "3d-spinner-react";
import { pulsingStarfield } from "3d-spinner/prefabs";

export default function PulsingStarfield() {
  return (
    <Spinner
      type="indeterminate"
      animation={() => pulsingStarfield().animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
