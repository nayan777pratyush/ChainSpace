const { spawn } = require("child_process");
const path = require("path");

const nextCli = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);

const env = {
  ...process.env,
  NODE_OPTIONS: [
    process.env.NODE_OPTIONS,
    "--openssl-legacy-provider",
  ]
    .filter(Boolean)
    .join(" "),
};

const child = spawn(process.execPath, [nextCli, "dev"], {
  stdio: "inherit",
  env,
});

child.on("error", (error) => {
  console.error("Failed to start Next.js:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
  }

  process.exit(code ?? 0);
});