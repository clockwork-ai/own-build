import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";
import { tarnhaleFiles, manifestSource } from "./tarnhale-manifest.mjs";
import { writeFile } from "node:fs/promises";

const root = process.cwd();
const publicDir = path.join(root, "public");

await rm(publicDir, { recursive: true, force: true });
await mkdir(path.join(root, "api"), { recursive: true });
await mkdir(publicDir, { recursive: true });

// Keep the Tarnhale subdomain file list in step with demos/tarnhale.
await writeFile(path.join(root, "lib", "tarnhale-files.js"), manifestSource(await tarnhaleFiles()));

await build({
  entryPoints: ["server/chat.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "api/chat.js",
  packages: "external",
  target: "node22",
  legalComments: "none",
});

const skip = new Set([
  "api",
  "lib",
  "server",
  "scripts",
  "node_modules",
  "public",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vercel.json",
  "README.md",
  "middleware.js",
]);

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.name.startsWith(".") || skip.has(entry.name)) continue;
  await cp(path.join(root, entry.name), path.join(publicDir, entry.name), { recursive: true });
}
