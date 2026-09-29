# Changelog

Notable changes, newest first. Versions before 1.0.0 are described in the git history.

## 1.1.0

Requires `3d-spinner` 1.1 or later.

### Added

- `show` prop on `<Spinner>`: turning it `false` plays the outro, then removes the host `div`;
  turning it `true` again mounts a fresh spinner. Unmounting still stops the spinner at once.
- `onFinish` option: runs when the spinner stops animating on its own (its outro finished, it was
  stopped before its intro, or it could not start), not on unmount or rebuild.
- `SpinnerHandle.stop()` returns a promise that resolves once the outro has finished, so hook
  users can `await spinner.stop()` before removing their element.

### Changed

- The `3d-spinner` peer dependency is `^1.1.0` (was `^1.0.0`), for its new `spinner.finished`.

### Internal

- Lifecycle tests for `show`, `onFinish`, and the `stop()` promise, including under StrictMode.
- The demo's prefab cards play the outro on Stop, and a new card shows `show` and `onFinish`.

## 1.0.1

### Added

- A live demo at https://runelaang.github.io/3d-spinner-react/, linked from the README: the
  prefabs and common React patterns, each with the complete component it runs.

### Internal

- The demo is a Vite app in `demo/` with its own `package.json`, so the package gains no
  dependencies. GitHub Pages deploys it from `main` on every release.

## 1.0.0

Requires `3d-spinner` 1.x. The public interface is stable from this version on and follows
semantic versioning: breaking changes only come with a new major version.

### Changed

- The `timeout` option is now `timeoutMs`, matching `3d-spinner` 1.0.0, which removed
  `timeout`. Rename the prop on `<Spinner>` and the option passed to `useSpinner`.
- The `3d-spinner` peer dependency is `^1.0.0` (was `>=0.9.9`).
- Mounting the same animation instance twice now throws, because `3d-spinner` treats animations
  as single-use. A bare instance passed as `animation` therefore throws when the spinner
  rebuilds (a structural prop change, or React StrictMode). Pass a factory
  (`() => new SpinAnimation()`) instead.

### Added

- `ariaLabel` option: the accessible name of the spinner's progress bar. Default `"Loading"`.
  Changing it rebuilds the spinner.

### Internal

- The lifecycle rebuild test uses an animation factory, since an instance can no longer be
  mounted twice.
