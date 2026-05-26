import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(desktopRoot, "..");
const targetDir = path.join(workspaceRoot, "target", "release");
const sourceCliPath = path.join(
  targetDir,
  process.platform === "win32" ? "jdkman.exe" : "jdkman",
);
const resourceDir = path.join(workspaceRoot, "target", "tauri-resources");
const resourceCliPath = path.join(
  resourceDir,
  process.platform === "win32" ? "jdkman.exe" : "jdkman",
);
const compatCliPath = path.join(
  resourceDir,
  process.platform === "win32" ? "jdkman" : "jdkman.exe",
);

async function main() {
  await execFileAsync("cargo", ["build", "-p", "java-manager-cli", "--release"], {
    cwd: workspaceRoot,
  });

  await mkdir(resourceDir, { recursive: true });
  await copyFile(sourceCliPath, resourceCliPath);
  await copyFile(sourceCliPath, compatCliPath);

  process.stdout.write(`Prepared CLI resource at ${resourceCliPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
