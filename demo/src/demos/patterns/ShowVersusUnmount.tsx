import { useState } from "react";
import { Spinner } from "3d-spinner-react";
import { planeStarTrail } from "3d-spinner/prefabs";

export default function ShowVersusUnmount() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  function toggle() {
    setLoading(!loading);
    setStatus(loading ? "Playing the outro..." : "");
  }

  return (
    <>
      <div className="demo-controls">
        <button onClick={toggle}>{loading ? "Finish loading" : "Load again"}</button>
        <output>{status}</output>
      </div>
      <div className="demo-columns">
        <figure>
          {loading && (
            <Spinner
              type="indeterminate"
              animation={() => planeStarTrail().animation}
              style={{ width: "100%", height: 200 }}
            />
          )}
          <figcaption>Conditional rendering: gone at once</figcaption>
        </figure>
        <figure>
          <Spinner
            show={loading}
            type="indeterminate"
            animation={() => planeStarTrail().animation}
            onFinish={() => setStatus("Outro finished, spinner removed")}
            style={{ width: "100%", height: 200 }}
          />
          <figcaption>show: outro first, then removed</figcaption>
        </figure>
      </div>
    </>
  );
}
