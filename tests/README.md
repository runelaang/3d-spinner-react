# Tests

Unit tests for `3d-spinner-react`, run with Node's built-in test runner
(`node:test` + `node:assert`) so the suite adds **zero dependencies** to the
package. `files: ["dist"]` keeps them out of the published tarball - they live on
GitHub but are never shipped.

```sh
npm test   # pretest builds dist/, then runs node --test tests/*.test.mjs
```

The tests import the compiled output from `dist/` and cover the pure option
resolution that drives the hook and component (`buildSpinnerOptions`,
`resolveAnimation`).

DOM-level lifecycle (rendering, StrictMode mount/unmount, `setProgress`
reactivity) is not covered here - that needs a `jsdom` + `react-dom/client` dev
dependency, which is a deliberate separate decision rather than something to pull
in by default.
