# PR Cannon 💣

> Fire your files to any repository as a Pull Request

A CLI tool that automatically creates Pull Requests by sending files to any GitHub repository. Simply specify a file and target repository, and pr-cannon handles everything: branch creation, commits, and PR generation.

[![npm version](https://badge.fury.io/js/pr-cannon.svg)](https://www.npmjs.com/package/pr-cannon)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚀 **Fully Automated**: File reading → Branch creation → Commit → PR creation
- 📁 **Flexible Path Control**: Custom destination paths with `--path` option
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
pr-cannon fire <file> <owner/repo>
```

You can also use the short alias `prca`:

```bash
prca fire <file> <owner/repo>
```

### Examples

**Send a file to repository:**

```bash
pr-cannon fire README.md is0692vs/pr-cannon
```

Or use the shorter command:

```bash
prca fire README.md is0692vs/pr-cannon
```

**Specify custom destination path:**

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

### Command Reference

```
pr-cannon fire [options] <file> <repo>

Arguments:
  file               File path to send
  repo               Repository in owner/repo format

Options:
  -p, --path <path>  Destination path in the repository
  -h, --help         Display help for command
```

## 📖 How It Works

1. **Reads** your local file and encodes it
2. **Connects** to GitHub API using your token
3. **Creates** a new branch with unique timestamp
4. **Commits** the file to the new branch
5. **Opens** a Pull Request automatically
6. **Displays** PR URL in your terminal

## 🎯 Use Cases

- **Quick file sharing** between repositories
- **Template distribution** to multiple projects
- **Configuration updates** across repositories
- **Documentation synchronization**
- **Code snippet sharing**

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

## 📝 Examples

### Real-world Scenarios

**1. Share configuration across projects:**

```bash
pr-cannon fire .eslintrc.json team/project-a --path .eslintrc.json
pr-cannon fire .eslintrc.json team/project-b --path .eslintrc.json
```

**2. Distribute documentation:**

```bash
pr-cannon fire API.md company/docs --path api/endpoints.md
```

**3. Send project files to showcase repository:**

```bash
pr-cannon fire src/main.ts showcase/repo --path examples/typescript/main.ts
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
pr-cannon fire <ファイル> <owner/repo>
```

短縮コマンド `prca` も使用できます:

```bash
prca fire <ファイル> <owner/repo>
```

**例: is0692vs/pr-cannon リポジトリにファイルを送信**

```bash
pr-cannon fire README.md is0692vs/pr-cannon
```

または短いコマンドで:

```bash
prca fire README.md is0692vs/pr-cannon
```

**カスタムパス指定:**

```bash
pr-cannon fire config.js is0692vs/myproject --path src/config.js
```

**ネストされたディレクトリに送信:**

```bash
pr-cannon fire guide.md is0692vs/docs --path docs/guides/setup.md
```

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
