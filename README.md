# BridgeToCampus

A static, GitHub Pages-ready prototype for the BridgeToCampus readiness companion.

## Files served by GitHub Pages

- `index.html`
- `styles.css`
- `app.js`
- `.nojekyll`
- `404.html`

The site has no build step. It can be published directly from the repository root.

## Local Preview

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

## GitHub Pages Setup

1. Create a GitHub repository.
2. Push this project to the repository.
3. In the repository, open `Settings` -> `Pages`.
4. Under `Build and deployment`, set `Source` to `Deploy from a branch`.
5. Select branch `main` and folder `/ (root)`.
6. Save. GitHub will show the public Pages URL after deployment.

