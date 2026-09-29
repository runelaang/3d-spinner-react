import { useState } from "react";
import { Spinner } from "3d-spinner-react";
import { SpinAnimation } from "3d-spinner/animations/spin";
import { tetrahedron } from "3d-spinner/engines/little-3d-engine";

export default function RebuildWithDeps() {
  const [color, setColor] = useState("#3b82f6");
  return (
    <>
      <div className="demo-controls">
        <select value={color} onChange={(event) => setColor(event.target.value)}>
          <option value="#3b82f6">blue</option>
          <option value="#16a34a">green</option>
          <option value="#ec4899">pink</option>
        </select>
      </div>
      <Spinner
        type="indeterminate"
        animation={() => new SpinAnimation({ shape: tetrahedron(), color })}
        deps={[color]}
        style={{ width: "100%", height: 240 }}
      />
    </>
  );
}
