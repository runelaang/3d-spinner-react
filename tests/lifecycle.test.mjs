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
  // 3d-spinner 1.0 rejects remounting an instance, so a rebuild needs a factory.
  const anims   = [];
  const factory = () => {
    const anim = new MockAnimation();
    anims.push(anim);
    return anim;
  };
  const count = (call) => anims.flatMap((a) => a.calls).filter((c) => c === call).length;
  const { rerender, unmount } = await mountHook({ animation: factory, type: "progress" });

  const mountsBefore  = count("mount");
  const destroyBefore = count("destroy");

  await rerender({ animation: factory, type: "indeterminate" });

  assert.equal(
    count("destroy"),
    destroyBefore + 1,
    "old spinner was not destroyed on type change",
  );
  assert.equal(
    count("mount"),
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

// ── Playing the outro before unmounting (show, onFinish, stop() promise) ──────

// Finishes its outro on the first frame after exit(), like a very short real outro.
class OutroAnimation extends MockAnimation {
  constructor() {
    super();
    this.exited = false;
  }
  exit(now)    { super.exit(now); this.exited = true; }
  isFinished() { return this.exited; }
}

function outroFactory() {
  const anims = [];
  const factory = () => {
    const anim = new OutroAnimation();
    anims.push(anim);
    return anim;
  };
  return { anims, factory };
}

function renderSpinner() {
  const container = makeContainer();
  const root      = createRoot(container);
  return {
    container,
    render:  (props) => act(async () => { root.render(createElement(Spinner, props)); }),
    frame:   () => act(async () => { flushRaf(); }),
    unmount: async () => {
      await act(async () => { root.unmount(); });
      container.remove();
    },
  };
}

test("<Spinner show={false}> plays the outro, then removes its host div", async () => {
  const { anims, factory } = outroFactory();
  const view  = renderSpinner();
  const props = { type: "indeterminate", animation: factory };

  await view.render({ ...props, show: true });
  await view.frame();
  assert.ok(anims[0].calls.includes("enter"), "intro did not start");

  await view.render({ ...props, show: false });
  assert.ok(anims[0].calls.includes("exit"), "outro did not start");
  assert.equal(view.container.firstChild?.tagName, "DIV", "host removed before the outro finished");
  assert.ok(!anims[0].calls.includes("destroy"), "destroyed before the outro finished");

  await view.frame();
  assert.equal(view.container.firstChild, null, "host still there after the outro");
  assert.ok(anims[0].calls.includes("destroy"), "not destroyed after the outro");

  await view.unmount();
});

test("<Spinner show={false}> before the intro removes the host at once", async () => {
  const { anims, factory } = outroFactory();
  const view  = renderSpinner();
  const props = { type: "progress", animation: factory };

  await view.render({ ...props, show: true });
  await view.render({ ...props, show: false });

  assert.equal(view.container.firstChild, null, "host still there");
  assert.ok(!anims[0].calls.includes("exit"), "an outro played without an intro");

  await view.unmount();
});

test("<Spinner> with show={false} from the start renders nothing until show turns true", async () => {
  const { anims, factory } = outroFactory();
  const view  = renderSpinner();
  const props = { type: "indeterminate", animation: factory };

  await view.render({ ...props, show: false });
  assert.equal(view.container.firstChild, null);
  assert.equal(anims.length, 0, "an animation was built while hidden");

  await view.render({ ...props, show: true });
  assert.equal(view.container.firstChild?.tagName, "DIV");
  assert.equal(anims.length, 1);

  await view.unmount();
});

test("<Spinner> shown again after its outro mounts a fresh animation", async () => {
  const { anims, factory } = outroFactory();
  const view  = renderSpinner();
  const props = { type: "indeterminate", animation: factory };

  await view.render({ ...props, show: true });
  await view.frame();
  await view.render({ ...props, show: false });
  await view.frame();
  assert.equal(view.container.firstChild, null);

  await view.render({ ...props, show: true });
  assert.equal(anims.length, 2, "no fresh animation");
  assert.ok(anims[1].calls.includes("mount"), "fresh animation not mounted");

  await view.unmount();
});

test("<Spinner> shown again during its outro restarts with a fresh animation", async () => {
  const { anims, factory } = outroFactory();
  const view  = renderSpinner();
  const props = { type: "indeterminate", animation: factory };

  await view.render({ ...props, show: true });
  await view.frame();
  await view.render({ ...props, show: false });
  await view.render({ ...props, show: true });

  assert.equal(anims.length, 2, "no fresh animation");
  assert.ok(anims[0].calls.includes("destroy"), "the exiting animation was kept");
  assert.equal(view.container.childElementCount, 1, "expected exactly one host div");

  await view.frame();
  assert.equal(view.container.firstChild?.tagName, "DIV", "the restarted spinner was removed");

  await view.unmount();
});

test("handle.stop() resolves after the outro and onFinish runs once, not on unmount", async () => {
  const { factory } = outroFactory();
  const view     = renderSpinner();
  const handle   = createRef();
  let finishes   = 0;
  let stopped    = false;

  await view.render({
    ref:       handle,
    type:      "indeterminate",
    animation: factory,
    onFinish:  () => { finishes++; },
  });
  await view.frame();

  const stopping = handle.current.stop().then(() => { stopped = true; });
  await act(async () => {});
  assert.equal(stopped, false, "resolved before the outro finished");
  assert.equal(finishes, 0, "onFinish ran before the outro finished");

  await view.frame();
  await stopping;
  assert.equal(stopped, true);
  assert.equal(finishes, 1);

  await view.unmount();
  assert.equal(finishes, 1, "onFinish ran again on unmount");
});

test("onFinish does not run when a running spinner is unmounted or rebuilt", async () => {
  const { factory } = outroFactory();
  const view     = renderSpinner();
  let finishes   = 0;
  const onFinish = () => { finishes++; };

  await view.render({ type: "indeterminate", animation: factory, onFinish });
  await view.frame();
  await view.render({ type: "indeterminate", animation: factory, onFinish, periodMs: 1000 });
  await view.unmount();

  assert.equal(finishes, 0);
});

test("useSpinner handle.stop() resolves at once when nothing is mounted", async () => {
  const { handle, unmount } = await mountHook({ animation: new MockAnimation(), type: "progress" });
  await unmount();
  await handle.stop();
});

test("show={false} under StrictMode plays one outro and fires onFinish once", async () => {
  const { StrictMode } = await import("react");
  const { anims, factory } = outroFactory();
  const container = makeContainer();
  const root      = createRoot(container);
  let finishes    = 0;
  const render = (show) =>
    act(async () => {
      root.render(
        createElement(StrictMode, null,
          createElement(Spinner, {
            show,
            type:      "indeterminate",
            animation: factory,
            onFinish:  () => { finishes++; },
          }),
        ),
      );
    });

  await render(true);
  await act(async () => { flushRaf(); });
  const live = anims.at(-1);
  await render(false);
  await act(async () => { flushRaf(); });

  assert.equal(container.firstChild, null, "host still there after the outro");
  assert.equal(live.calls.filter((c) => c === "exit").length, 1, "expected exactly one outro");
  assert.equal(finishes, 1, "onFinish should run once");

  await act(async () => { root.unmount(); });
  container.remove();
});
