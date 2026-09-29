import { Spinner } from "3d-spinner-react";
import { monochromeStreak } from "3d-spinner/prefabs";

export default function MonochromeStreak({ show }: { show: boolean }) {
  return (
    <Spinner
      show={show}
      type="indeterminate"
      animation={() => monochromeStreak().animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
