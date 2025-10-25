#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync, statSync } from "fs";
import * as fs from "fs/promises";
import { join, dirname, basename, resolve } from "path";
import { fileURLToPath } from "url";
import {
  readFileAsBase64,
  collectFilesRecursively,
  readMultipleFiles,
  FileReadError,
  resolveFilePath,
  checkFileAccess,
  FileContent,
} from "./utils/fileReader.js";
import {
  getRepoInfo,
  GitHubError,
  createBranchWithFile,
  createPullRequest,
  generateBranchName,
  getGitHubToken,
  createOctokitClient,
  parseRepoUrl,
  isRepoOwner,
  mergePullRequest,
  deleteBranch,
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
  .description("Fire multiple files or folders to a repository as a PR")
  .argument(
    "<paths...>",
    "Files or folders to send (last argument is the repository)"
  )
  .option("-p, --path <path>", "Destination path in the repository")
  .option(
    "-m, --auto-merge",
    "Automatically merge PR if no conflicts and you are the repo owner"
  )
  .option(
    "-k, --keep-branch",
    "Keep the branch after auto-merging (default: delete branch)"
  )
  .action(async (inputArgs: string[], options) => {
    try {
      // 最後の引数をレポジトリとして分離
      if (inputArgs.length < 2) {
        console.error(
          "❌ Error: At least one file/folder and a repository must be specified"
        );
        console.error("� Usage: prca fire <file1> [file2...] <owner/repo>");
        process.exit(1);
      }

      const repo = inputArgs[inputArgs.length - 1];
      const inputPaths = inputArgs.slice(0, -1);

      console.log(`🎯 Targeting: ${repo}`);
      console.log(`📦 Input paths: ${inputPaths.length} item(s)`);

      // すべてのファイルを収集
      const allFiles: FileContent[] = [];
      const processedPaths: string[] = [];

      for (const inputPath of inputPaths) {
        try {
          const resolvedPath = resolveFilePath(inputPath);
          await checkFileAccess(resolvedPath);
          const stats = await fs.stat(resolvedPath);

          if (stats.isDirectory()) {
            console.log(`📁 Collecting files from directory: ${inputPath}`);
            const dirFiles = await collectFilesRecursively(inputPath);

            if (dirFiles.length === 0) {
              console.error(
                `❌ Error: Directory is empty or contains only excluded files: ${inputPath}`
              );
              process.exit(1);
            }

            const contents = await readMultipleFiles(dirFiles, inputPath);
            allFiles.push(...contents);
            processedPaths.push(`${inputPath}/ (${dirFiles.length} files)`);
          } else {
            console.log(`📄 Reading file: ${inputPath}`);
            const fileContent = await readFileAsBase64(inputPath);
            const fileName = basename(inputPath);
            allFiles.push({
              path: fileName,
              content: fileContent.content,
              encoding: "base64" as const,
            });
            processedPaths.push(inputPath);
          }
        } catch (error) {
          if (error instanceof FileReadError) {
            console.error(`❌ Error: ${error.message}`);
          } else {
            console.error(`❌ Error accessing path "${inputPath}"`);
          }
          process.exit(1);
        }
      }

      console.log(`\n✅ Total files collected: ${allFiles.length}`);
      processedPaths.forEach((p) => console.log(`   - ${p}`));

      // GitHub API連携
      console.log(`\n🔗 Connecting to GitHub...`);
      const repoInfo = await getRepoInfo(repo);
      console.log(`✅ Repository: ${repoInfo.fullName}`);
      console.log(`🌿 Default branch: ${repoInfo.defaultBranch}`);

      // ブランチ名の生成（複数ファイル対応）
      const branchName =
        inputPaths.length === 1
          ? generateBranchName(inputPaths[0])
          : generateBranchName("multiple-files");

      // ファイルをコミット
      console.log(`\n🌿 Creating branch and committing...`);
      const { branchName: createdBranch, commitSha } =
        await createBranchWithFile(repo, "pr-cannon", allFiles, branchName);
      console.log(`✅ Branch created: ${createdBranch}`);
      console.log(`✅ Commit created: ${commitSha.substring(0, 7)}`);

      // Pull Request を作成
      console.log(`\n🚀 Creating pull request...`);
      const filePaths = allFiles.map((f) => f.path);
      const { prNumber, prUrl } = await createPullRequest(
        repo,
        createdBranch,
        inputPaths.length === 1 ? basename(inputPaths[0]) : "multiple files",
        filePaths,
        allFiles.length
      );

      console.log(`✅ Pull request created: #${prNumber}`);
      console.log(`🔗 PR URL: ${prUrl}`);

      // --auto-merge フラグが有効な場合
      if (options.autoMerge) {
        console.log("\n🔄 Checking if auto-merge is possible...");

        const token = getGitHubToken();
        const octokit = createOctokitClient(token);
        const { owner, repo: repoName } = parseRepoUrl(repo);

        // オーナー確認
        const isOwner = await isRepoOwner(octokit, owner, repoName);

        if (!isOwner) {
          console.log(
            "⚠️  Auto-merge skipped: You are not the owner of this repository."
          );
        } else {
          console.log("✓ Repository owner confirmed.");
          console.log("🔄 Attempting to merge...");

          // マージ実行
          const result = await mergePullRequest(
            octokit,
            owner,
            repoName,
            prNumber
          );

          if (result.success) {
            console.log(`✅ ${result.message}`);
            console.log("🎉 PR has been automatically merged!");

            // ブランチ削除（--keep-branchが指定されていない場合）
            if (!options.keepBranch) {
              console.log("\n🗑️  Deleting branch...");
              const deleteResult = await deleteBranch(
                octokit,
                owner,
                repoName,
                createdBranch
              );

              if (deleteResult.success) {
                console.log(`✅ ${deleteResult.message}`);
              } else {
                console.log(
                  `⚠️  Failed to delete branch: ${deleteResult.message}`
                );
                console.log("   (The PR was merged successfully)");
              }
            } else {
              console.log("\n📌 Branch kept (--keep-branch flag was used)");
            }
          } else {
            console.log(`⚠️  Auto-merge failed: ${result.message}`);
            console.log(`   Please merge manually: ${prUrl}`);
          }
        }
      }

      console.log(`\n🎉 Done! ${allFiles.length} file(s) have been fired! 💣`);
    } catch (error) {
      if (error instanceof FileReadError) {
        console.error(`\n❌ File Error: ${error.message}`);
        process.exit(1);
      }
      if (error instanceof GitHubError) {
        console.error(`\n❌ GitHub Error: ${error.message}`);
        process.exit(1);
      }
      console.error(`\n❌ Unexpected error:`, error);
      process.exit(1);
    }
  });

program
  .command("test")
  .description("Create a test PR from current directory")
  .argument("<repo>", "Repository (owner/repo format)")
  .option("-p, --path <path>", "Destination path in the repository")
  .action(async (repo, options) => {
    try {
      const cwd = process.cwd();
      console.log(`🧪 Test PR Creation Mode`);
      console.log(`📍 Current directory: ${cwd}`);
      console.log(`🎯 Target repository: ${repo}`);

      // カレントディレクトリの状態を確認
      const stat = statSync(cwd);
      if (!stat.isDirectory()) {
        throw new FileReadError("Current working directory is not valid", cwd);
      }

      console.log(`\n📊 Analyzing current directory...`);

      // ディレクトリ内のファイルを再帰的に収集
      const absoluteFilePaths = await collectFilesRecursively(cwd);
      console.log(`✅ Found ${absoluteFilePaths.length} files to test`);

      if (absoluteFilePaths.length === 0) {
        throw new FileReadError(
          "No files found in current directory (or all excluded)",
          "NO_FILES"
        );
      }

      // 複数ファイルを読み込み
      let fileContentsArray = await readMultipleFiles(absoluteFilePaths, cwd);

      const dirName = basename(cwd);
      console.log(`📁 Directory name: ${dirName}`);

      // 送信先パスを決定
      let destinationBase = options.path || `test-${dirName}-${Date.now()}`;
      fileContentsArray = fileContentsArray.map((f) => ({
        path: join(destinationBase, f.path),
        content: f.content,
        encoding: "base64" as const,
      }));

      // GitHub API連携
      console.log(`\n🔗 Connecting to GitHub...`);
      const repoInfo = await getRepoInfo(repo);
      console.log(`✅ Repository: ${repoInfo.fullName}`);

      // ファイルをコミット
      console.log(`\n🌿 Creating test branch...`);
      const { branchName, commitSha } = await createBranchWithFile(
        repo,
        cwd,
        fileContentsArray
      );
      console.log(`✅ Branch created: ${branchName}`);
      console.log(`✅ Commit created: ${commitSha.substring(0, 7)}`);

      // Pull Request を作成
      console.log(`\n🚀 Creating test PR...`);
      const filePaths = fileContentsArray.map((f) => f.path);
      const { prNumber, prUrl } = await createPullRequest(
        repo,
        branchName,
        `test: ${dirName}`,
        filePaths,
        absoluteFilePaths.length
      );

      console.log(`✅ Test PR created: #${prNumber}`);
      console.log(`🔗 PR URL: ${prUrl}`);
      console.log(`\n📝 Test Info:`);
      console.log(`   Files: ${absoluteFilePaths.length}`);
      console.log(`   Destination: ${destinationBase}`);
      console.log(`\n🎉 Test PR ready for validation! 🧪`);
    } catch (error) {
      if (error instanceof FileReadError) {
        console.error(`\n❌ File Error: ${error.message}`);
        process.exit(1);
      }
      if (error instanceof GitHubError) {
        console.error(`\n❌ GitHub Error: ${error.message}`);
        process.exit(1);
      }
      console.error(`\n❌ Unexpected error:`, error);
      process.exit(1);
    }
  });

program.parse();
