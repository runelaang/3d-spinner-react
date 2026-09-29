import { Spinner } from "3d-spinner-react";
import { monochromeStreak } from "3d-spinner/prefabs";

export default function MonochromeStreak() {
  return (
    <Spinner
      type="indeterminate"
      animation={() => monochromeStreak().animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
