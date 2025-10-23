import { Octokit } from "@octokit/rest";

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
