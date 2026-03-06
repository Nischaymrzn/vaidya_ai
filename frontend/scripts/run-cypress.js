#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require("node:child_process");
const path = require("node:path");

delete process.env.ELECTRON_RUN_AS_NODE;

const cypressPkgPath = require.resolve("cypress/package.json");
const cypressBin = path.join(path.dirname(cypressPkgPath), "bin", "cypress");
const args = process.argv.slice(2);
const hasReporterFlag = args.includes("--reporter") || args.some((arg) => arg.startsWith("--reporter="));
const isRunCommand = args.includes("run");

if (isRunCommand && !hasReporterFlag) {
  args.push("--reporter", "spec");
}

const child = spawn(process.execPath, [cypressBin, ...args], {
  stdio: "inherit",
  env: {
    ...process.env,
    FORCE_COLOR: process.env.FORCE_COLOR || "1",
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
