# casamento_migueltania – Astro + GitHub Pages

This repo contains an Astro site scaffolded in `./basics` and a GitHub Actions workflow to deploy to Pages.

## Develop locally

```powershell
cd basics
npm run dev
```

## Build locally (optional)

```powershell
cd basics
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Create a new GitHub repo and push this folder.
2. Ensure your default branch is `main`.
3. In the repo, go to Settings → Pages and set Source to "GitHub Actions".
4. If this is a project site (username.github.io/repo), add a repository variable `PAGES_BASE_PATH` with value `/<repo-name>/`. For a user/org site (username.github.io), leave it empty.
5. Push to `main`. The workflow `.github/workflows/deploy.yml` will build the site from `basics` and publish the `dist` folder to Pages.

Deployed URL will appear in the workflow summary under the "Deploy to GitHub Pages" step.
