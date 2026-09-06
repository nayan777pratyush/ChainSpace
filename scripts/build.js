const { spawnSync } = require("child_process");
const path = require("path");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_OPTIONS: [
        process.env.NODE_OPTIONS,
        "--openssl-legacy-provider",
      ]
        .filter(Boolean)
        .join(" "),
    },
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const hardhatCli = path.join(
  process.cwd(),
  "node_modules",
  "hardhat",
  "internal",
  "cli",
  "cli.js"
);

const nextCli = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);

try {
  console.log("→ Compiling smart contracts...");
  run(process.execPath, [hardhatCli, "compile"]);

  console.log("→ Building Next.js application...");
  run(process.execPath, [nextCli, "build"]);

  console.log("✓ ChainSpace production build completed successfully.");
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
}