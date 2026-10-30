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

There are four tests: 30 single-event observations for each API and one
`times: 5` observation for each API. All record the immediate listener count
before any eventual-delivery polling. The multiple-event probes have no retry.

Three fresh-process comparisons on the same published 5.0.5 artifact failed all
four assertions on each baseline run and passed all four after adding only Edge
to the existing Chromium/Chrome frame-wait predicate. In every baseline batch
probe, four events had arrived at resolution and the fifth arrived afterward.
Single-event timing varied; the `late` array records calls that returned early.

The installed artifact was restored exactly after the comparison. This repository
ships the unmodified public dependencies, so its assertions are expected to fail
on the recorded environment. The upstream source experiment is separate.

The final assertion expresses the proposed behavior to discuss with maintainers,
not a claim that the API documents a universal completion guarantee. One animation
frame is a heuristic. Polling for the listener's result is the current workaround.
Timing can vary by environment; no headed, background, other-platform or full-CI
claim is made. An earlier workspace patched run failed before a profile/optimizer
refresh; its cause remains unexplained. Published and workspace versions are
different, particularly in their fake-timer handling.

Pinned versions: Vitest and `@vitest/browser` 5.0.5,
`@vitest/browser-webdriverio` 5.0.0, WebdriverIO 9.29.1, Vite 8.0.11.

## Context

The Edge omission from the existing Chromium frame wait was publicly noted by Zhuyuyangyy in
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
