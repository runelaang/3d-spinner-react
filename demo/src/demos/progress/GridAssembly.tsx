import { Spinner } from "3d-spinner-react";
import { gridAssembly } from "3d-spinner/prefabs";

export default function GridAssembly({ show, progress }: { show: boolean; progress: number }) {
  return (
    <Spinner
      show={show}
      progress={progress}
      animation={() => gridAssembly().animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
