#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync, statSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import {
  readFileAsBase64,
  collectFilesRecursively,
  readMultipleFiles,
  FileReadError,
} from "./utils/fileReader.js";
import {
  getRepoInfo,
  GitHubError,
  createBranchWithFile,
  createPullRequest,
} from "./utils/github.js";

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
  .description("Fire a file or folder to a repository as a PR")
  .argument("<file>", "File or folder path to send")
  .argument("<repo>", "Repository (owner/repo format)")
  .option("-p, --path <path>", "Destination path in the repository")
  .action(async (fileOrFolder, repo, options) => {
    try {
      console.log(`🎯 Targeting: ${repo}`);
      console.log(`📄 Source: ${fileOrFolder}`);

      // ファイル/フォルダの存在確認とタイプ判定
      const stat = statSync(fileOrFolder);
      const isDirectory = stat.isDirectory();

      let fileContentsArray: Array<{ path: string; content: string }> = [];
      let sourceName: string;
      let filePaths: string[] = [];

      if (isDirectory) {
        // ✅ フォルダ処理
        console.log(`📁 Directory detected`);
        sourceName = basename(fileOrFolder);

        // ディレクトリ内のファイルを再帰的に収集
        const absoluteFilePaths = await collectFilesRecursively(fileOrFolder);
        console.log(`✅ Found ${absoluteFilePaths.length} files`);

        if (absoluteFilePaths.length === 0) {
          throw new FileReadError(
            "No files found in directory (or all excluded)",
            "NO_FILES"
          );
        }

        // 複数ファイルを読み込み（相対パスを保持）
        fileContentsArray = await readMultipleFiles(
          absoluteFilePaths,
          fileOrFolder
        );
        filePaths = fileContentsArray.map((f) => f.path);

        // 送信先パスを決定
        let destinationBase = options.path || sourceName;
        fileContentsArray = fileContentsArray.map((f) => ({
          path: join(destinationBase, f.path),
          content: f.content,
        }));
      } else {
        // ✅ ファイル処理（既存ロジック）
        const fileContent = await readFileAsBase64(fileOrFolder);
        console.log(`✅ File loaded: ${fileContent.path}`);
        console.log(
          `📦 Content size: ${fileContent.content.length} bytes (base64)`
        );

        // Base64 をデコード
        const decodedContent = Buffer.from(
          fileContent.content,
          "base64"
        ).toString("utf-8");

        // 送信先パスを決定
        const destinationPath = options.path || basename(fileOrFolder);
        fileContentsArray = [
          {
            path: destinationPath,
            content: decodedContent,
          },
        ];
        filePaths = [destinationPath];
        sourceName = basename(fileOrFolder);
      }

      // GitHub API連携
      console.log("\n🔗 Connecting to GitHub...");
      const repoInfo = await getRepoInfo(repo);
      console.log(`✅ Repository: ${repoInfo.fullName}`);
      console.log(`🌿 Default branch: ${repoInfo.defaultBranch}`);
      console.log(`� Files to add: ${fileContentsArray.length}`);

      // ファイルをコミット
      console.log("\n🌿 Creating branch and committing...");
      const { branchName, commitSha } = await createBranchWithFile(
        repo,
        fileOrFolder,
        fileContentsArray
      );
      console.log(`✅ Branch created: ${branchName}`);
      console.log(`✅ Commit created: ${commitSha.substring(0, 7)}`);

      // Pull Request を作成
      console.log("\n🚀 Creating pull request...");
      const { prNumber, prUrl } = await createPullRequest(
        repo,
        branchName,
        sourceName,
        filePaths
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
