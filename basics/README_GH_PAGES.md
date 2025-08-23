# Astro on GitHub Pages

This project is configured to deploy to GitHub Pages using GitHub Actions.

## Repository setup

1. Create a new GitHub repository and push this folder (or the whole workspace) to it.
2. Ensure the default branch is `main`.
3. In Settings → Pages, set Source to "GitHub Actions".
4. (Optional) If this is a project site (username.github.io/repo), set a repository variable named `PAGES_BASE_PATH` to `/<repo-name>/` so links work, e.g. `/my-repo/`.

## Local development

```
npm run dev
```

## Build locally

```
npm run build
npm run preview
```

## Notes

- The workflow under `.github/workflows/deploy.yml` builds from the `basics` subfolder and deploys `dist`.
- The Astro `base` config reads `BASE_URL` from the environment. The workflow passes `PAGES_BASE_PATH` to it.
