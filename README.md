# Monitor Acuity Calculator

This calculator was created to answer a practical question about monitors/televisions: for a given screen size and viewing distance, what screen resolutions can you actually tell apart? 

## Run locally

```bash
npx serve .
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

## Structure

- `js/physics/` — geometry, population model, CSF, MTF, SQRI, verdict (no DOM)
- `js/ui/` — charts and cards (D3 bundled in production via `npm run build`)
- `js/data/` — resolution presets and references

Methodology and numbered references are at the bottom of the page.
