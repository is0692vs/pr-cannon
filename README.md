# PR Cannon 💣

> Fire your files to any repository as a Pull Request

A CLI tool that automatically creates Pull Requests by sending files to any GitHub repository. Simply specify a file and target repository, and pr-cannon handles everything: branch creation, commits, and PR generation.

[![npm version](https://badge.fury.io/js/pr-cannon.svg)](https://www.npmjs.com/package/pr-cannon)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚀 **Fully Automated**: File reading → Branch creation → Commit → PR creation
- 📁 **Folder Support**: Send entire directories with multiple files (Issue #7)
- 🗂️ **Directory Structure Preservation**: Maintains folder hierarchy in target repository
- 📄 **Flexible Path Control**: Custom destination paths with `--path` option
- 🧪 **Test Command**: `prca test` for quick testing from current directory
- 🔒 **Secure**: Uses GitHub Personal Access Token
- 🎯 **Simple CLI**: Intuitive command-line interface
- 📦 **Multiple File Types**: Supports Markdown, JavaScript, JSON, text files, etc.
- 🌿 **Unique Branches**: Timestamp-based branch names prevent conflicts
- ⚡ **Fast**: Creates PRs in seconds

## 📦 Installation

```bash
npm install -g pr-cannon
```

## 🔧 Setup

### 1. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
4. Generate and copy your token

### 2. Set Environment Variable

**macOS/Linux:**

```bash
# Add to ~/.zshrc or ~/.bashrc
export GITHUB_TOKEN="ghp_your_token_here"

# Apply changes
source ~/.zshrc  # or source ~/.bashrc
```

**Windows (PowerShell):**

```powershell
$env:GITHUB_TOKEN="ghp_your_token_here"
```

**Windows (Command Prompt):**

```cmd
set GITHUB_TOKEN=ghp_your_token_here
```

## 🚀 Usage

### Basic Usage

```bash
pr-cannon fire <file-or-folder> [file-or-folder...] <owner/repo>
```

You can also use the short alias `prca`:

```bash
prca fire <file-or-folder> [file-or-folder...] <owner/repo>
```

### Examples

**Send a single file to repository:**

```bash
pr-cannon fire README.md is0692vs/pr-cannon
```

Or use the shorter command:

```bash
prca fire README.md is0692vs/pr-cannon
```

**Send multiple files in a single PR (Issue #8):**

```bash
pr-cannon fire README.md config.json LICENSE is0692vs/pr-cannon
```

This creates a single PR with all three files.

**Send multiple folders in a single PR:**

```bash
pr-cannon fire ./src ./tests ./docs is0692vs/project
```

All files from all folders will be included in one PR while maintaining directory structure.

**Mix files and folders in a single PR:**

```bash
pr-cannon fire README.md ./src LICENSE ./docs is0692vs/project
```

Combines individual files and entire directories into one PR.

**Send an entire folder to repository:**

```bash
pr-cannon fire ./src is0692vs/project --path uploaded/src
```

This will recursively send all files from `./src` directory while maintaining the folder structure.

**Specify custom destination path for file:**

```bash
pr-cannon fire config.js is0692vs/project --path src/config.js
```

**Send file to nested directory:**

```bash
pr-cannon fire guide.md is0692vs/docs --path docs/guides/setup.md
```

**Send from subdirectory:**

```bash
pr-cannon fire ./examples/sample.txt is0692vs/showcase
```

**Multiple files with custom paths:**

```bash
pr-cannon fire config.json types.ts utils.ts is0692vs/project --path src/
```

All files will be placed in the `src/` directory maintaining their original filenames.

### Test Mode

Create a test PR from the current directory with automatic timestamp-based paths:

```bash
pr-cannon test <repo>
```

Or use the short alias:

```bash
prca test is0692vs/test-pr-cannon
```

This command:

- 📍 Collects all files from the current directory
- ⏰ Creates an automatic destination path with timestamp
- 🧪 Perfect for testing the folder sending feature

### Command Reference

**Fire Command:**

```
pr-cannon fire [options] <file-or-folder> [file-or-folder...] <repo>

Arguments:
  file-or-folder     One or more file or folder paths to send
  repo               Repository in owner/repo format

Options:
  -p, --path <path>  Destination path in the repository
  -m, --auto-merge   Automatically merge PR if no conflicts and you are the repo owner
  -k, --keep-branch  Keep the branch after auto-merging (by default, branch is deleted after merge)
  -h, --help         Display help for command
```

**Batch Multiple Files/Folders:**

You can specify multiple files and/or folders to send them all in a single PR:

```bash
# Multiple files
pr-cannon fire file1.md file2.md config.json owner/repo

# Multiple folders
pr-cannon fire ./src ./tests ./docs owner/repo

# Mix files and folders
pr-cannon fire README.md ./src ./docs LICENSE owner/repo

# With custom path
pr-cannon fire config.md utils.js ./helpers owner/repo --path src/
```

All items will be combined into a single Pull Request.

### Auto-merge (for your own repositories)

```bash
# Automatically merge after PR creation
prca fire config.json is0692vs/my-repo --auto-merge

# Short version
prca fire config.json is0692vs/my-repo -m

# Works with multiple files too
prca fire file1.js file2.js is0692vs/my-repo -m

# Keep branch after auto-merge
prca fire config.json is0692vs/my-repo -m -k
```

**Note:** Auto-merge only works if:

- You are the owner of the target repository
- There are no merge conflicts
- All required checks pass

By default, the branch is automatically deleted after merging (following GitHub's standard workflow).
If you want to keep the branch, use the `--keep-branch` / `-k` flag.

**Test Command:**

```
pr-cannon test [options] <repo>

Arguments:
  repo               Repository in owner/repo format

Options:
  -p, --path <path>  Custom destination path (optional)
  -h, --help         Display help for command
```

## 📖 How It Works

### File Sending

1. **Reads** your local file and encodes it
2. **Connects** to GitHub API using your token
3. **Creates** a new branch with unique timestamp
4. **Commits** the file to the new branch
5. **Opens** a Pull Request automatically
6. **Displays** PR URL in your terminal

### Folder Sending (Issue #7) & Multiple Files/Folders (Issue #8)

1. **Detects** if input is a file or directory
2. **Recursively collects** all files from directories while:
   - Excluding `.git`, `node_modules`, `.DS_Store`, and hidden files
   - Preserving directory structure with relative paths
3. **Reads** all files and encodes them
4. **Combines multiple inputs** into a single file list when multiple paths are specified
5. **Connects** to GitHub API using your token
6. **Creates** a new branch with unique timestamp
7. **Commits** all files in a single commit (preserves structure)
8. **Opens** a Pull Request automatically
9. **Displays** PR URL and summary in your terminal

## 🎯 Use Cases

- **Quick file sharing** between repositories
- **Template distribution** to multiple projects
- **Configuration updates** across repositories
- **Documentation synchronization**
- **Code snippet sharing**
- **Bulk folder deployment** across projects
- **Multi-file library distribution**

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/is0692vs/pr-cannon.git
cd pr-cannon

# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/index.mjs fire <file> <repo>
```

## 🧪 Testing

The project includes a comprehensive test suite for the folder sending feature (Issue #7).

### Quick Test Verification

```bash
# Verify test structure and files
./tests/verify.sh
```

### Run Full Test Suite

Prerequisites:

- `gh` (GitHub CLI): https://cli.github.com/
- `GITHUB_TOKEN` environment variable set

```bash
# Run tests against a test repository
./tests/run-tests.sh is0692vs/test-pr-cannon

# Then cleanup test PRs
./tests/cleanup.sh is0692vs/test-pr-cannon
```

**What gets tested:**

- ✅ Single file sending
- ✅ Folder/directory sending with multiple files
- ✅ Directory structure preservation
- ✅ File exclusion patterns (.git, node_modules, hidden files)
- ✅ Edge cases (deeply nested directories, special characters)

For detailed testing documentation, see [TESTING.md](TESTING.md) and [tests/README.md](tests/README.md).

## 📝 Examples

### Real-world Scenarios

**1. Share single configuration file across projects:**

```bash
pr-cannon fire .eslintrc.json team/project-a --path .eslintrc.json
pr-cannon fire .eslintrc.json team/project-b --path .eslintrc.json
```

**2. Send entire source folder to another repository:**

```bash
pr-cannon fire ./src team/shared-lib --path lib/source
```

This sends all files under `./src` directory while maintaining the structure.

**3. Distribute documentation folder:**

```bash
pr-cannon fire ./docs company/knowledge-base --path markdown/guides
```

**4. Share project templates:**

```bash
pr-cannon fire ./templates/react-app showcase/templates --path templates/react
```

**5. Send configuration directory:**

```bash
pr-cannon fire ./config team/project --path config
```

**6. Send multiple template files in one PR (Issue #8):**

```bash
pr-cannon fire ./templates/react ./templates/vue ./templates/svelte showcase/all-templates
```

**7. Setup complete project structure in one PR:**

```bash
pr-cannon fire ./src ./tests ./docs README.md LICENSE new-project/repo
```

This sends all source code, tests, documentation, and metadata files in a single PR.

## ⚠️ Troubleshooting

### "GitHub token not found" error

Make sure `GITHUB_TOKEN` environment variable is set:

```bash
echo $GITHUB_TOKEN  # Should display your token
```

### "Authentication failed" error

Your token may be expired or invalid. Generate a new token with `repo` scope.

### "Repository not found" error

- Verify the repository exists
- Check you have access to the repository
- Ensure format is correct: `owner/repo`

### "File not found" error

- Verify the file path is correct
- Use absolute or relative paths
- Check file permissions

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 👤 Author

**Hiroki Mukai**

- GitHub: [@is0692vs](https://github.com/is0692vs)

## 🙏 Acknowledgments

Built with:

- [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- [Octokit](https://github.com/octokit/octokit.js) - GitHub API client
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

## 🇯🇵 日本語ドキュメント

### 概要

pr-cannon は、ファイルを任意の GitHub リポジトリに送信し、自動的に Pull Request を作成する CLI ツールです。

### インストール

```bash
npm install -g pr-cannon
```

### セットアップ

1. **GitHub トークンの作成**

   - GitHub Settings → Developer settings → Personal access tokens
   - "Generate new token (classic)" をクリック
   - `repo` スコープを選択
   - トークンをコピー

2. **環境変数の設定**

```bash
# ~/.zshrc または ~/.bashrc に追加
export GITHUB_TOKEN="ghp_your_token_here"

# 変更を適用
source ~/.zshrc
```

### 使い方

**基本的な使い方:**

```bash
pr-cannon fire <ファイルまたはフォルダ> [ファイルまたはフォルダ...] <owner/repo>
```

短縮コマンド `prca` も使用できます:

```bash
prca fire <ファイルまたはフォルダ> [ファイルまたはフォルダ...] <owner/repo>
```

**例: is0692vs/pr-cannon リポジトリにファイルを送信**

```bash
pr-cannon fire README.md is0692vs/pr-cannon
```

または短いコマンドで:

```bash
prca fire README.md is0692vs/pr-cannon
```

**複数ファイルを 1 つの PR で送信（Issue #8）:**

```bash
pr-cannon fire README.md config.json LICENSE is0692vs/pr-cannon
```

3 つのファイルすべてが 1 つの PR に含まれます。

**複数フォルダを 1 つの PR で送信:**

```bash
pr-cannon fire ./src ./tests ./docs is0692vs/project
```

すべてのフォルダ内のすべてのファイルが 1 つの PR に含まれ、ディレクトリ構造が保持されます。

**ファイルとフォルダを混在して 1 つの PR で送信:**

```bash
pr-cannon fire README.md ./src LICENSE ./docs is0692vs/project
```

個別ファイルと全体ディレクトリが 1 つの PR に統合されます。

**フォルダ全体を送信:**

```bash
pr-cannon fire ./src is0692vs/project --path uploaded/src
```

`./src` ディレクトリ内のすべてのファイルをフォルダ構造を保持しながら送信します。

**カスタムパス指定:**

```bash
pr-cannon fire config.js is0692vs/myproject --path src/config.js
```

**ネストされたディレクトリに送信:**

```bash
pr-cannon fire guide.md is0692vs/docs --path docs/guides/setup.md
```

### 自動マージ（自分のリポジトリの場合）

```bash
# PR作成後に自動マージ
prca fire config.json is0692vs/my-repo --auto-merge

# 短縮版
prca fire config.json is0692vs/my-repo -m

# 複数ファイルでも使用可能
prca fire file1.js file2.js is0692vs/my-repo -m

# マージ後にブランチを残す
prca fire config.json is0692vs/my-repo -m -k
```

**注意:** 自動マージは以下の条件を満たす場合のみ動作します：

- 対象リポジトリのオーナーである
- マージコンフリクトがない
- すべての必須チェックが通過している

デフォルトでは，マージ後にブランチが自動削除されます（GitHub の標準的なワークフロー）．
ブランチを残したい場合は，`--keep-branch` / `-k` フラグを使用してください．

**テストモード（現在のディレクトリから PR を作成）:**

```bash
prca test is0692vs/test-pr-cannon
```

このコマンドで：

- 📍 カレントディレクトリのすべてのファイルを収集
- ⏰ タイムスタンプベースの自動送信先パスを作成
- 🧪 フォルダ送信機能のテストに最適

### 主な機能

- ✅ ファイル読み込み → ブランチ作成 → コミット → PR 作成を全自動化
- ✅ `--path`オプションで送信先パスをカスタマイズ
- ✅ `--auto-merge` / `-m` オプションで PR 作成後に自動マージ（自分のリポジトリのみ）
- ✅ タイムスタンプ付きブランチ名で重複を防止
- ✅ 明確なエラーメッセージ

### オプション

- `--path <path>` / `-p`: リポジトリ内の送信先パスを指定
- `--auto-merge` / `-m`: リポジトリのオーナーでありコンフリクトがない場合，PR 作成後に自動的にマージします
- `--keep-branch` / `-k`: 自動マージ後にブランチを残します（デフォルトではマージ後にブランチ削除）

### トラブルシューティング

**"GitHub token not found"エラー:**

```bash
echo $GITHUB_TOKEN  # トークンが表示されることを確認
```

**"Authentication failed"エラー:**

- トークンが期限切れの可能性があります
- `repo`スコープを含む新しいトークンを生成してください

### ライセンス

MIT License

---

Made with 💣 by [is0692vs](https://github.com/is0692vs)
