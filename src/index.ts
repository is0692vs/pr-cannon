#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileAsBase64, FileReadError } from "./utils/fileReader.js";

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
  .action(async (file, repo, options) => {
    try {
      console.log(`🎯 Targeting: ${repo}`);
      console.log(`📄 File: ${file}`);

      // ファイルを読み込み
      const fileContent = await readFileAsBase64(file);
      console.log(`✅ File loaded: ${fileContent.path}`);
      console.log(
        `📦 Content size: ${fileContent.content.length} bytes (base64)`
      );

      if (options.path) {
        console.log(`📍 Destination: ${options.path}`);
      }

      console.log("\n⚠️  GitHub API integration coming soon...");
    } catch (error) {
      if (error instanceof FileReadError) {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
      }
      throw error;
    }
  });

program.parse();
