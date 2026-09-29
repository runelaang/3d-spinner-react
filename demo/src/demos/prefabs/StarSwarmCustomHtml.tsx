import { Spinner } from "3d-spinner-react";
import { starSwarm } from "3d-spinner/prefabs";

function message() {
  const element = document.createElement("div");
  element.innerHTML = `<div style="display:grid;gap:.35rem;text-align:center">
    <strong style="font-size:1.9rem;color:#fff">Building your scene</strong>
    <span style="font-size:.85rem;color:#bae6fd;font-weight:500">Custom HTML message</span>
  </div>`;
  return element;
}

export default function StarSwarmCustomHtml() {
  return (
    <Spinner
      type="indeterminate"
      animation={() => starSwarm({ label: message() }).animation}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
