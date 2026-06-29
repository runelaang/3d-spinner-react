import { test } from "node:test";
import assert from "node:assert/strict";

import { buildSpinnerOptions, resolveAnimation } from "../dist/options.js";

const fakeAnimation = { mount() {}, enter() {}, exit() {}, render() {}, isFinished: () => true, destroy() {} };

test("resolveAnimation returns an instance as-is", () => {
  assert.equal(resolveAnimation(fakeAnimation), fakeAnimation);
});

test("resolveAnimation calls a factory and returns its result", () => {
  let calls = 0;
  const factory = () => {
    calls += 1;
    return fakeAnimation;
  };
  assert.equal(resolveAnimation(factory), fakeAnimation);
  assert.equal(calls, 1);
});

test("progress is the default mode", () => {
  const options = buildSpinnerOptions({ animation: fakeAnimation }, fakeAnimation);
  assert.equal(options.type, "progress");
  assert.equal(options.animation, fakeAnimation);
});

test("progress options pass through, indeterminate-only options are dropped", () => {
  const until = new Date();
  const options = buildSpinnerOptions(
    { animation: fakeAnimation, progress: 0.4, timeout: 5000, until, loop: "restart", periodMs: 1000 },
    fakeAnimation,
  );
  assert.equal(options.type, "progress");
  assert.equal(options.progress, 0.4);
  assert.equal(options.timeout, 5000);
  assert.equal(options.until, until);
  assert.equal("loop" in options, false);
  assert.equal("periodMs" in options, false);
});

test("indeterminate options pass through, progress-only options are dropped", () => {
  const options = buildSpinnerOptions(
    { animation: fakeAnimation, type: "indeterminate", loop: "bounce", periodMs: 1500, progress: 0.5, timeout: 9 },
    fakeAnimation,
  );
  assert.equal(options.type, "indeterminate");
  assert.equal(options.loop, "bounce");
  assert.equal(options.periodMs, 1500);
  assert.equal("progress" in options, false);
  assert.equal("timeout" in options, false);
  assert.equal("until" in options, false);
});

test("omitted optional fields are left out entirely", () => {
  const progress = buildSpinnerOptions({ animation: fakeAnimation }, fakeAnimation);
  assert.deepEqual(Object.keys(progress).sort(), ["animation", "type"]);

  const indeterminate = buildSpinnerOptions(
    { animation: fakeAnimation, type: "indeterminate" },
    fakeAnimation,
  );
  assert.deepEqual(Object.keys(indeterminate).sort(), ["animation", "type"]);
});
