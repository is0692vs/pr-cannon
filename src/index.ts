#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// package.jsonからバージョン情報を読み込む
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8")
);

const program = new Command();

program
  .name("pr-cannon")
  .description("💣 Fire your files to any repository as a Pull Request")
  .version(packageJson.version);

program
  .command("fire")
  .description("Fire a file to a repository as a PR")
  .argument("<file>", "File path to send")
  .argument("<repo>", "Repository (owner/repo format)")
  .option("-p, --path <path>", "Destination path in the repository")
  .action((file, repo, options) => {
    console.log(`🎯 Targeting: ${repo}`);
    console.log(`📄 File: ${file}`);
    if (options.path) {
      console.log(`📍 Destination: ${options.path}`);
    }
    console.log("\n⚠️  Implementation coming soon...");
  });

program.parse();
