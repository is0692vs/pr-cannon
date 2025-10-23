import { Octokit } from "@octokit/rest";
import { basename, dirname } from "path";

export interface RepoInfo {
  owner: string;
  repo: string;
  defaultBranch: string;
  fullName: string;
}

export class GitHubError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "GitHubError";
  }
}

/**
 * リポジトリURLをパースする（owner/repo形式）
 */
export function parseRepoUrl(repoUrl: string): { owner: string; repo: string } {
  const match = repoUrl.match(/^([^/]+)\/([^/]+)$/);
  if (!match) {
    throw new GitHubError(
      `Invalid repository format: ${repoUrl}. Expected format: owner/repo`
    );
  }
  return { owner: match[1], repo: match[2] };
}

/**
 * GitHub Personal Access Tokenを取得する
 */
export function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new GitHubError(
      "GitHub token not found. Please set GITHUB_TOKEN environment variable."
    );
  }
  return token;
}

/**
 * Octokitクライアントを作成する
 */
export function createOctokitClient(token: string): Octokit {
  return new Octokit({ auth: token });
}

/**
 * リポジトリ情報を取得する
 */
export async function getRepoInfo(repoUrl: string): Promise<RepoInfo> {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const token = getGitHubToken();
  const octokit = createOctokitClient(token);

  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    return {
      owner,
      repo,
      defaultBranch: data.default_branch,
      fullName: data.full_name,
    };
  } catch (error: any) {
    if (error.status === 401) {
      throw new GitHubError(
        "Authentication failed. Please check your GITHUB_TOKEN.",
        "AUTH_FAILED"
      );
    }
    if (error.status === 404) {
      throw new GitHubError(
        `Repository not found: ${owner}/${repo}`,
        "REPO_NOT_FOUND"
      );
    }
    throw new GitHubError(
      `Failed to fetch repository info: ${error.message}`,
      "API_ERROR"
    );
  }
}

/**
 * ブランチ名を生成する
 */
export function generateBranchName(filePath: string): string {
  const fileName = basename(filePath);
  const timestamp = Date.now();
  return `pr-cannon/add-${fileName}-${timestamp}`;
}

/**
 * ファイルをコミットして新しいブランチを作成する（複数ファイル対応）
 */
export async function createBranchWithFile(
  repoUrl: string,
  sourcePathOrFile: string,
  fileContents: Array<{ path: string; content: string }>, // path: 送信先パス, content: デコード済みテキスト
  branchNamePrefix?: string
): Promise<{ branchName: string; commitSha: string }> {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const token = getGitHubToken();
  const octokit = createOctokitClient(token);

  try {
    // リポジトリ情報を取得
    const repoInfo = await getRepoInfo(repoUrl);
    const defaultBranch = repoInfo.defaultBranch;

    // デフォルトブランチの最新コミットを取得
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const baseSha = refData.object.sha;

    // 新しいブランチ名を生成
    const branchName =
      branchNamePrefix ||
      `pr-cannon/add-${basename(sourcePathOrFile)}-${Date.now()}`;

    // 新しいブランチを作成
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });

    // ベースツリーを取得
    const { data: baseCommit } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: baseSha,
    });
    const baseTreeSha = baseCommit.tree.sha;

    // 複数ファイル用のツリーオブジェクトを作成
    const treeEntries = fileContents.map((file) => ({
      path: file.path,
      mode: "100644" as const,
      type: "blob" as const,
      content: file.content,
    }));

    // 新しいツリーを作成（複数ファイルを追加）
    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: treeEntries,
    });

    // 新しいコミットを作成
    const commitMessage =
      fileContents.length === 1
        ? `Add ${basename(fileContents[0].path)} via pr-cannon`
        : `Add ${fileContents.length} files via pr-cannon`;

    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [baseSha],
    });

    // ブランチの参照を更新
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branchName}`,
      sha: newCommit.sha,
    });

    return {
      branchName,
      commitSha: newCommit.sha,
    };
  } catch (error: any) {
    if (error.status === 422) {
      throw new GitHubError(
        "Failed to create branch or commit. The file might already exist.",
        "COMMIT_FAILED"
      );
    }
    throw new GitHubError(
      `Failed to create branch with file: ${error.message}`,
      "API_ERROR"
    );
  }
}

/**
 * Pull Requestを作成する（複数ファイル対応）
 */
export async function createPullRequest(
  repoUrl: string,
  branchName: string,
  sourceName: string, // ファイル名またはディレクトリ名
  fileList: string[], // 追加されたファイルのパスリスト
  totalFileCount?: number // 合計ファイル数（複数送信時用）
): Promise<{ prNumber: number; prUrl: string }> {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const token = getGitHubToken();
  const octokit = createOctokitClient(token);

  try {
    const repoInfo = await getRepoInfo(repoUrl);
    const defaultBranch = repoInfo.defaultBranch;

    // PR タイトルを生成
    const fileCount = totalFileCount || fileList.length;
    const title =
      fileCount === 1
        ? `Add ${basename(fileList[0])} via pr-cannon`
        : `Add ${fileCount} files via pr-cannon`;

    // PR 説明文を生成（複数ファイル対応）
    let bodyChanges: string;
    if (fileCount === 1) {
      bodyChanges = `- Added file: \`${fileList[0]}\``;
    } else if (fileList.length <= 10) {
      bodyChanges = `- Added ${fileCount} files:\n${fileList
        .map((f) => `  - \`${f}\``)
        .join("\n")}`;
    } else {
      bodyChanges = `- Added ${fileCount} files:\n${fileList
        .slice(0, 10)
        .map((f) => `  - \`${f}\``)
        .join(
          "\n"
        )}\n  - ... and ${fileCount - 10} more files`;
    }

    const body = `🎯 This PR was automatically created by [pr-cannon](https://github.com/is0692vs/pr-cannon)

## Changes
${bodyChanges}

---
Generated by pr-cannon 💣`;

    // Pull Request を作成
    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title,
      body,
      head: branchName,
      base: defaultBranch,
    });

    return {
      prNumber: pr.number,
      prUrl: pr.html_url,
    };
  } catch (error: any) {
    if (error.status === 422) {
      throw new GitHubError(
        "Failed to create pull request. A PR may already exist for this branch.",
        "PR_FAILED"
      );
    }
    throw new GitHubError(
      `Failed to create pull request: ${error.message}`,
      "API_ERROR"
    );
  }
}
