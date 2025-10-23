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
pr-cannon fire <file-or-folder> <owner/repo>
```

You can also use the short alias `prca`:

```bash
prca fire <file-or-folder> <owner/repo>
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
pr-cannon fire [options] <file-or-folder> <repo>

Arguments:
  file-or-folder     File or folder path to send
  repo               Repository in owner/repo format

Options:
  -p, --path <path>  Destination path in the repository
  -h, --help         Display help for command
```

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

### Folder Sending (Issue #7)
1. **Detects** if input is a file or directory
2. **Recursively collects** all files from directory while:
   - Excluding `.git`, `node_modules`, `.DS_Store`, and hidden files
   - Preserving directory structure with relative paths
3. **Reads** all files and encodes them
4. **Connects** to GitHub API using your token
5. **Creates** a new branch with unique timestamp
6. **Commits** all files in a single commit (preserves structure)
7. **Opens** a Pull Request automatically
8. **Displays** PR URL and summary in your terminal

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
pr-cannon fire <ファイルまたはフォルダ> <owner/repo>
```

短縮コマンド `prca` も使用できます:

```bash
prca fire <ファイルまたはフォルダ> <owner/repo>
```

**例: is0692vs/pr-cannon リポジトリにファイルを送信**

```bash
pr-cannon fire README.md is0692vs/pr-cannon
```

または短いコマンドで:

```bash
prca fire README.md is0692vs/pr-cannon
```

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
- ✅ タイムスタンプ付きブランチ名で重複を防止
- ✅ 明確なエラーメッセージ

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
