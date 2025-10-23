#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileAsBase64, FileReadError } from "./utils/fileReader.js";
import {
  getRepoInfo,
  GitHubError,
  createBranchWithFile,
  createPullRequest,
} from "./utils/github.js";
import { basename } from "path";

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

      // GitHub API連携
      console.log("\n🔗 Connecting to GitHub...");
      const repoInfo = await getRepoInfo(repo);
      console.log(`✅ Repository: ${repoInfo.fullName}`);
      console.log(`🌿 Default branch: ${repoInfo.defaultBranch}`);

      // 送信先パスを決定
      const destinationPath = options.path || basename(file);
      console.log(`📍 Destination: ${destinationPath}`);

      // ファイルをBase64デコードしてコミット
      const decodedContent = Buffer.from(
        fileContent.content,
        "base64"
      ).toString("utf-8");

      console.log("\n🌿 Creating branch and committing file...");
      const { branchName, commitSha } = await createBranchWithFile(
        repo,
        file,
        decodedContent,
        destinationPath
      );
      console.log(`✅ Branch created: ${branchName}`);
      console.log(`✅ Commit created: ${commitSha.substring(0, 7)}`);

      // Pull Request を作成
      console.log("\n🚀 Creating pull request...");
      const { prNumber, prUrl } = await createPullRequest(
        repo,
        branchName,
        file,
        destinationPath
      );

      console.log(`✅ Pull request created: #${prNumber}`);
      console.log(`🔗 PR URL: ${prUrl}`);
      console.log("\n🎉 Done! Your file has been fired! 💣");
    } catch (error) {
      if (error instanceof FileReadError) {
        console.error(`\n❌ File Error: ${error.message}`);
        process.exit(1);
      }
      if (error instanceof GitHubError) {
        console.error(`\n❌ GitHub Error: ${error.message}`);
        process.exit(1);
      }
      throw error;
    }
  });

program.parse();
