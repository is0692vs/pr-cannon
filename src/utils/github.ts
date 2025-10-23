import { Octokit } from "@octokit/rest";
import { basename } from "path";

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
 * ファイルをコミットして新しいブランチを作成する
 */
export async function createBranchWithFile(
  repoUrl: string,
  filePath: string,
  fileContent: string,
  destinationPath: string
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
    const branchName = generateBranchName(filePath);

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

    // 新しいツリーを作成（ファイルを追加）
    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: [
        {
          path: destinationPath,
          mode: "100644",
          type: "blob",
          content: fileContent,
        },
      ],
    });

    // 新しいコミットを作成
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `Add ${basename(filePath)} via pr-cannon`,
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
