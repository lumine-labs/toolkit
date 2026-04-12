# Toolkit Workspace

Monorepo configured with `pnpm` workspaces for utility-level packages.

## Structure

- `packages/react-di` - existing package migrated from the repository root.
- `packages/*` - place for new util packages.

## Quick Start

```bash
pnpm install
pnpm -r build
pnpm -r test
pnpm lint
pnpm format:check
```

## Create a new util package

```bash
mkdir -p packages/my-util
cd packages/my-util
pnpm init
```

Then add your local scripts (`build`, `test`, `typecheck`) in `packages/my-util/package.json` and they will be picked up by root commands.
