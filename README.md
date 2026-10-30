# Edge Wheel Delivery Reproduction

This reproduces `locator.wheel()` and `userEvent.wheel()` resolving before an
element's wheel listener runs in Edge. It tests listener delivery, not completed
scrolling, rendering, or asynchronous work started by the handler.

## Run

Prerequisites: Node.js 22.12+, 24+, or 26+ as allowed by `package.json`,
pnpm 11.28.6, and Microsoft Edge. The recorded run used Node 24.21.0 and
Edge 156.0.4314.56 on macOS arm64.

```sh
pnpm install --frozen-lockfile
pnpm test
```

All JavaScript dependencies are pinned in `package.json` and `pnpm-lock.yaml`.
No Vitest source checkout or workspace links are needed. WebdriverIO downloads
the matching driver into `.cache/driver` when the test starts. Dependency install
scripts for Edge/Firefox drivers are explicitly disabled; no system browser is
installed by this repository.

For an Edge executable outside its normal installation location, set `EDGE_BINARY`
to its absolute path and `EDGEDRIVER_VERSION` to its version before running the
test. For example, use the version printed by that executable's `--version`
option. This was how the recorded workspace-extracted Edge run was configured.

Each run creates a new isolated profile under `.cache/edge-profile-*` and forces
Vite dependency optimization. It does not use an existing personal profile.
After the test exits, `.cache` can be deleted to remove profiles and drivers.

## Expected Observation

On the recorded public-package setup, both tests fail: all 30 calls in each case
return before the listener runs. The listener still runs afterward, and polling
confirms that before the next observation starts. The final `late` array records
which calls returned early.

The final assertion expresses the proposed behavior to discuss with maintainers,
not a claim that the API documents a universal completion guarantee. Polling for
the listener's result is the current workaround. Timing can vary by environment.

Pinned versions: Vitest and `@vitest/browser` 5.0.5,
`@vitest/browser-webdriverio` 5.0.0, WebdriverIO 9.29.1, Vite 8.0.11.

## Context

The Edge omission from the existing Chromium frame wait was publicly noted in
[vitest-dev/vitest#11793](https://github.com/vitest-dev/vitest/pull/11793).
This reproduction is separate from that PR's `toHaveStyle` work and issue #11668.
It includes no upstream fix. The one-line upstream experiment is kept separately.

To report the environment with the same command requested by Vitest's issue form:

```sh
npx envinfo --system --npmPackages '{vitest*,@vitest/*,vite,@vitejs/*,playwright,webdriverio}' --binaries --browsers
```

The reproduction and local verification were prepared with AI assistance.
The original reproduction files are MIT licensed; dependency licenses remain
with their respective packages.
