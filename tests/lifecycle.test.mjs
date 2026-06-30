// DOM lifecycle tests for useSpinner and <Spinner>.
// Uses jsdom for a browser-like DOM and a MockAnimation to avoid canvas.

import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

// ── jsdom boot — must run before React is imported ────────────────────────────

const { window } = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  pretendToBeVisual: true,
  url: "http://localhost",
});

function setGlobal(key, value) {
  try {
    globalThis[key] = value;
  } catch {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
}

setGlobal("window",      window);
setGlobal("document",    window.document);
setGlobal("HTMLElement", window.HTMLElement);
setGlobal("SVGElement",  window.SVGElement);
setGlobal("navigator",   window.navigator);
setGlobal("location",    window.location);
setGlobal("Event",       window.Event);
setGlobal("CustomEvent", window.CustomEvent);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Predictable rAF: never auto-fires; tests call flushRaf() to run one batch.
const _rafQueue = new Map();
let _rafSeq = 0;
globalThis.requestAnimationFrame = (cb) => {
  const id = ++_rafSeq;
  _rafQueue.set(id, cb);
  return id;
};
globalThis.cancelAnimationFrame = (id) => _rafQueue.delete(id);

function flushRaf() {
  const entries = [..._rafQueue.entries()];
  _rafQueue.clear();
  for (const [, cb] of entries) cb(performance.now());
}

// ── Dynamic imports (must see the globals above) ──────────────────────────────

const { createElement, useRef, createRef, act } = await import("react");
const { createRoot }                              = await import("react-dom/client");
const { useSpinner, Spinner }                     = await import("../dist/index.js");

// ── MockAnimation: implements SpinnerAnimation without canvas ─────────────────

class MockAnimation {
  constructor() {
    this.calls = [];
    this._el   = null;
  }
  mount(target) {
    this.calls.push("mount");
    this._el = document.createElement("span");
    this._el.dataset.mock = "spinner";
    target.appendChild(this._el);
  }
  enter(now)           { this.calls.push("enter"); }
  exit(now)            { this.calls.push("exit"); }
  render(now, frame)   { this.calls.push("render"); }
  isFinished()         { return false; }
  destroy() {
    this.calls.push("destroy");
    this._el?.remove();
    this._el = null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeContainer() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

// Renders a minimal component that calls useSpinner. Returns helpers for
// re-rendering with new config and for unmounting.
async function mountHook(config) {
  const container = makeContainer();
  let capturedHandle = null;

  function TestHook({ cfg }) {
    const ref = useRef(null);
    capturedHandle = useSpinner(ref, cfg);
    return createElement("div", { ref });
  }

  const root = createRoot(container);
  await act(async () => {
    root.render(createElement(TestHook, { cfg: config }));
  });

  return {
    handle:   capturedHandle,
    container,
    rerender: async (newCfg) => {
      await act(async () => {
        root.render(createElement(TestHook, { cfg: newCfg }));
      });
      return capturedHandle;
    },
    unmount: async () => {
      await act(async () => { root.unmount(); });
      container.remove();
    },
  };
}

// ── useSpinner tests ──────────────────────────────────────────────────────────

test("useSpinner — mounts the animation into the container", async () => {
  const anim = new MockAnimation();
  const { container, unmount } = await mountHook({ animation: anim, type: "progress" });

  assert.ok(anim.calls.includes("mount"), "mount was not called");
  assert.ok(container.querySelector("[data-mock=spinner]"), "spinner element not in DOM");

  await unmount();
});

test("useSpinner — destroys the animation when the component unmounts", async () => {
  const anim = new MockAnimation();
  const { unmount } = await mountHook({ animation: anim, type: "progress" });

  assert.ok(!anim.calls.includes("destroy"), "destroy called too early");
  await unmount();
  assert.ok(anim.calls.includes("destroy"), "destroy was not called on unmount");
});

test("useSpinner — returns a handle with setProgress, stop, destroy", async () => {
  const anim = new MockAnimation();
  const { handle, unmount } = await mountHook({ animation: anim, type: "progress" });

  assert.equal(typeof handle.setProgress, "function");
  assert.equal(typeof handle.stop,        "function");
  assert.equal(typeof handle.destroy,     "function");

  await unmount();
});

test("useSpinner — setProgress, stop, destroy do not throw", async () => {
  const anim = new MockAnimation();
  const { handle, unmount } = await mountHook({ animation: anim, type: "progress" });

  assert.doesNotThrow(() => handle.setProgress(0.5));
  assert.doesNotThrow(() => handle.stop());
  assert.doesNotThrow(() => handle.destroy());

  await unmount();
});

test("useSpinner — changing type rebuilds the spinner (destroy + new mount)", async () => {
  const anim = new MockAnimation();
  const { rerender, unmount } = await mountHook({ animation: anim, type: "progress" });

  const mountsBefore  = anim.calls.filter((c) => c === "mount").length;
  const destroyBefore = anim.calls.filter((c) => c === "destroy").length;

  await rerender({ animation: anim, type: "indeterminate" });

  assert.equal(
    anim.calls.filter((c) => c === "destroy").length,
    destroyBefore + 1,
    "old spinner was not destroyed on type change",
  );
  assert.equal(
    anim.calls.filter((c) => c === "mount").length,
    mountsBefore + 1,
    "new spinner was not mounted on type change",
  );

  await unmount();
});

// ── <Spinner> component tests ─────────────────────────────────────────────────

test("<Spinner> renders a host div", async () => {
  const container = makeContainer();
  const root      = createRoot(container);
  const anim      = new MockAnimation();

  await act(async () => {
    root.render(
      createElement(Spinner, { animation: anim, type: "progress", style: { width: 60, height: 60 } }),
    );
  });

  assert.equal(container.firstChild?.tagName, "DIV");

  await act(async () => { root.unmount(); });
  container.remove();
});

test("<Spinner> host div has position:relative by default", async () => {
  const container = makeContainer();
  const root      = createRoot(container);
  const anim      = new MockAnimation();

  await act(async () => {
    root.render(
      createElement(Spinner, { animation: anim, type: "progress", style: { width: 60, height: 60 } }),
    );
  });

  assert.equal(container.firstChild?.style?.position, "relative");

  await act(async () => { root.unmount(); });
  container.remove();
});

test("<Spinner> className is forwarded to the host div", async () => {
  const container = makeContainer();
  const root      = createRoot(container);
  const anim      = new MockAnimation();

  await act(async () => {
    root.render(
      createElement(Spinner, {
        animation: anim,
        type: "progress",
        className: "my-spinner",
        style: { width: 60, height: 60 },
      }),
    );
  });

  assert.ok(container.firstChild?.classList.contains("my-spinner"));

  await act(async () => { root.unmount(); });
  container.remove();
});

test("<Spinner> forwarded ref exposes setProgress, stop, destroy", async () => {
  const container  = makeContainer();
  const root       = createRoot(container);
  const anim       = new MockAnimation();
  const spinnerRef = createRef();

  await act(async () => {
    root.render(
      createElement(Spinner, {
        ref:       spinnerRef,
        animation: anim,
        type:      "progress",
        style:     { width: 60, height: 60 },
      }),
    );
  });

  assert.equal(typeof spinnerRef.current?.setProgress, "function");
  assert.equal(typeof spinnerRef.current?.stop,        "function");
  assert.equal(typeof spinnerRef.current?.destroy,     "function");

  await act(async () => { root.unmount(); });
  container.remove();
});

test("<Spinner> destroys the animation when unmounted", async () => {
  const container = makeContainer();
  const root      = createRoot(container);
  const anim      = new MockAnimation();

  await act(async () => {
    root.render(
      createElement(Spinner, { animation: anim, type: "progress", style: { width: 60, height: 60 } }),
    );
  });

  assert.ok(!anim.calls.includes("destroy"), "destroy called before unmount");

  await act(async () => { root.unmount(); });
  container.remove();

  assert.ok(anim.calls.includes("destroy"), "destroy not called on unmount");
});

// Make flushRaf available so future tests can trigger animation frames if needed.
export { flushRaf };
