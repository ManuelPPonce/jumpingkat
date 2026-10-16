import { spawn } from "node:child_process";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID);

const command = onRailway
  ? [path.resolve(here, "../server/index.js")]
  : [path.join(path.dirname(createRequire(import.meta.url).resolve("vite/package.json")), "bin/vite.js")];

const child = spawn(process.execPath, command, { stdio: "inherit", cwd: here });

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
