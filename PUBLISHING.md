# Publishing `@wppconnect/whaileys`

Published to npm as **`@wppconnect/whaileys`** from the **`publish`** branch via
**OIDC trusted publishing** (no npm token).

## Why a `publish` branch

- `main` mirrors upstream (canove/whaileys) → syncing/rebasing is conflict-free.
- `publish` is the only branch where `package.json` has the scoped `name` and
  the fork's `repository.url` (OIDC provenance requires the repo to match).

Keep `publish` rebased on `main`; the only diff should be those `package.json`
fields.

## First publish (manual — once, needs npm access)

```bash
git fetch origin
git checkout publish
npm ci || npm install
npm run build:all

npm login                 # account with rights on the @wppconnect scope
npm publish --access public --provenance
```

> Requires npm ≥ 11.5.1 and Node ≥ 22.14.0.

## Configure the Trusted Publisher

On npmjs.com → `@wppconnect/whaileys` → **Settings → Trusted Publishers → Add** →
GitHub Actions:

- Repository: `wppconnect-team/whaileys`
- Workflow file: `.github/workflows/publish-wppconnect.yml`

Then every push to `publish` publishes automatically via OIDC.

## Releasing a new version

```bash
git checkout publish
git rebase main
npm version <new-version> --no-git-tag-version
git commit -am "release: @wppconnect/whaileys vX.Y.Z"
git push origin publish
```
