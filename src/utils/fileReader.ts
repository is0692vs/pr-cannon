import { readFile, access, readdir, stat } from "fs/promises";
import { resolve, isAbsolute, relative, join } from "path";
import { constants } from "fs";

export interface FileContent {
  path: string;
  content: string;
  encoding: "base64";
}

export class FileReadError extends Error {
  constructor(message: string, public readonly filePath: string) {
    super(message);
    this.name = "FileReadError";
  }
}

/**
 * ファイルパスを絶対パスに解決する
 */
export function resolveFilePath(filePath: string): string {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  return resolve(process.cwd(), filePath);
}

/**
 * ファイルの存在と読み取り権限を確認する
 */
export async function checkFileAccess(filePath: string): Promise<void> {
  try {
    await access(filePath, constants.R_OK);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new FileReadError(`File not found: ${filePath}`, filePath);
    }
    if ((error as NodeJS.ErrnoException).code === "EACCES") {
      throw new FileReadError(`Permission denied: ${filePath}`, filePath);
    }
    throw new FileReadError(`Cannot access file: ${filePath}`, filePath);
  }
}

/**
 * ファイルを読み込み，Base64エンコードする
 */
export async function readFileAsBase64(filePath: string): Promise<FileContent> {
  const absolutePath = resolveFilePath(filePath);

  await checkFileAccess(absolutePath);

  try {
    const buffer = await readFile(absolutePath);
    const base64Content = buffer.toString("base64");

    return {
      path: absolutePath,
      content: base64Content,
      encoding: "base64",
    };
  } catch (error) {
    throw new FileReadError(
      `Failed to read file: ${(error as Error).message}`,
      absolutePath
    );
  }
}

/**
 * 除外すべきパターンをチェック
 */
export function shouldExclude(filePath: string): boolean {
  const excluded = [".git", "node_modules", ".DS_Store"];
  const parts = filePath.split("/");

  // ファイル名またはディレクトリ名が除外対象か確認
  for (const part of parts) {
    if (excluded.includes(part)) return true;
    // 隠しファイル・ディレクトリ（.で始まる）を除外
    if (part.startsWith(".")) return true;
  }

  return false;
}

/**
 * ディレクトリを再帰的に走査し，全ファイルのパスを取得
 */
export async function collectFilesRecursively(
  dirPath: string
): Promise<string[]> {
  const absolutePath = resolveFilePath(dirPath);

  try {
    const stats = await stat(absolutePath);
    if (!stats.isDirectory()) {
      throw new FileReadError(`Not a directory: ${dirPath}`, absolutePath);
    }

    await checkFileAccess(absolutePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EACCES") {
      throw new FileReadError(
        `Cannot read directory: permission denied - ${dirPath}`,
        absolutePath
      );
    }
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new FileReadError(`Directory not found: ${dirPath}`, absolutePath);
    }
    throw error;
  }

  const files: string[] = [];

  async function traverse(currentPath: string): Promise<void> {
    const entries = await readdir(currentPath, { withFileTypes: true });

    if (entries.length === 0) {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      const relativePath = relative(absolutePath, fullPath);

      if (shouldExclude(relativePath)) {
        continue;
      }

      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        await traverse(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  await traverse(absolutePath);

  if (files.length === 0) {
    throw new FileReadError(
      `The directory is empty or no files found after filtering: ${dirPath}`,
      absolutePath
    );
  }

  return files;
}

/**
 * 複数ファイルを読み込む
 */
export async function readMultipleFiles(
  filePaths: string[],
  baseDir?: string
): Promise<FileContent[]> {
  const results: FileContent[] = [];

  for (const filePath of filePaths) {
    const absolutePath = resolveFilePath(filePath);
    await checkFileAccess(absolutePath);

    try {
      const buffer = await readFile(absolutePath);
      const base64Content = buffer.toString("base64");

      // baseDir が指定されている場合は相対パスを計算
      let displayPath = absolutePath;
      if (baseDir) {
        const baseDirAbsolute = resolveFilePath(baseDir);
        displayPath = relative(baseDirAbsolute, absolutePath);
      }

      results.push({
        path: displayPath,
        content: base64Content,
        encoding: "base64",
      });
    } catch (error) {
      throw new FileReadError(
        `Failed to read file: ${(error as Error).message}`,
        absolutePath
      );
    }
  }

  return results;
}
