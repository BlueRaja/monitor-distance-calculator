import * as esbuild from "esbuild";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

mkdirSync(dist, { recursive: true });

await esbuild.build({
  entryPoints: [join(root, "js", "main.js")],
  bundle: true,
  minify: true,
  format: "esm",
  external: ["d3"],
  outfile: join(dist, "app.js"),
  logLevel: "info",
});

cpSync(join(root, "css"), join(dist, "css"), { recursive: true });

let html = readFileSync(join(root, "index.html"), "utf8");
html = html.replace('src="js/main.js"', 'src="app.js"');
writeFileSync(join(dist, "index.html"), html);

console.log("Built dist/app.js, dist/index.html, dist/css/");
