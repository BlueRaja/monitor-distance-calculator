# Monitor Acuity Calculator

Interactive calculator for display resolution vs viewing distance. Two linked charts (room plan and threshold matrix) update shared screen size and distance. Verdicts combine the Ashraf et al. population resolution model with Barten SQRI upgrade sizing.

## Run locally

ES modules require HTTP:

```bash
npx serve .
# or
python -m http.server 8080
```

Open the URL shown (e.g. `http://localhost:3000`).

## Tests

```bash
npm test
```

## Production build

Bundles application JS (including D3) into one file. Output is written to `dist/` for static hosting:

```bash
npm install
npm run build
npx serve dist
```

On Windows, use the same commands in PowerShell or Command Prompt.

## Structure

- `js/physics/` — geometry, population model, CSF, MTF, SQRI, verdict (no DOM)
- `js/ui/` — charts and cards (D3 bundled in production via `npm run build`)
- `js/data/` — resolution presets and references

Methodology and numbered references are at the bottom of the page.
