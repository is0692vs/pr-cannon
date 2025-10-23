import { readFile, access } from "fs/promises";
import { resolve, isAbsolute } from "path";
import { constants } from "fs";

export interface FileContent {
  path: string;
  content: string; // Base64エンコード済み
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
