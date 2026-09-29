import { Spinner } from "3d-spinner-react";
import { squareMotion } from "3d-spinner/motion";
import { starSwarm } from "3d-spinner/prefabs";

export default function SquareStarPatrol({ show }: { show: boolean }) {
  return (
    <Spinner
      show={show}
      type="indeterminate"
      loop="restart"
      animation={() =>
        starSwarm({
          particles: {
            emitter: squareMotion({ size: 1.1 }),
            colors: ["#fef3c7", "#fb7185", "#c4b5fd"],
          },
        }).animation
      }
      style={{ width: "100%", height: "100%" }}
    />
  );
}
