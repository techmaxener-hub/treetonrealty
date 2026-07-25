// `output: "standalone"` (next.config.ts) produces .next/standalone/ --
// a self-contained server with a pruned node_modules -- but deliberately
// leaves out public/ and .next/static/, since Vercel serves those from
// its own CDN rather than the Node process. A self-hosted deployment
// (e.g. Hostinger) has no separate CDN, so the standalone server needs
// its own copies to serve static assets at all. Runs as `postbuild` so
// this happens on every `next build`, no manual step to forget.
import { cp, access } from "node:fs/promises";
import { constants } from "node:fs";

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function copyIfExists(from, to) {
  if (!(await exists(from))) return;
  await cp(from, to, { recursive: true });
  console.log(`Copied ${from} -> ${to}`);
}

if (await exists(".next/standalone")) {
  await copyIfExists("public", ".next/standalone/public");
  await copyIfExists(".next/static", ".next/standalone/.next/static");
} else {
  console.log("No .next/standalone directory -- skipping (output: \"standalone\" not built this run).");
}
