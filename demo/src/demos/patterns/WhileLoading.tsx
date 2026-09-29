import { useState } from "react";
import { Spinner } from "3d-spinner-react";
import { starSwarm } from "3d-spinner/prefabs";

function fakeRequest() {
  return new Promise((resolve) => setTimeout(resolve, 3000));
}

export default function WhileLoading() {
  const [loading, setLoading] = useState(false);
  const [loads, setLoads] = useState(0);

  async function load() {
    setLoading(true);
    await fakeRequest();
    setLoading(false);
    setLoads((count) => count + 1);
  }

  return (
    <>
      <div className="demo-controls">
        <button onClick={load} disabled={loading}>
          Load data
        </button>
        <output>{loading ? "Loading..." : loads ? `Data loaded (${loads}x)` : "Nothing loaded yet"}</output>
      </div>
      <Spinner
        show={loading}
        type="indeterminate"
        animation={() => starSwarm({ label: "Fetching data" }).animation}
        style={{ width: "100%", height: 240 }}
      />
    </>
  );
}
