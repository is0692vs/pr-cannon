# PR Cannon Tests

This directory contains test files and scripts for the pr-cannon folder sending feature (Issue #7).

## Test Structure

### `/single-file`
Tests single file sending functionality
- `sample.md` - Simple markdown file

### `/folder-structure`
Tests folder sending with multiple files
- `src/index.js` - Main JavaScript file
- `src/utils.js` - Utility functions
- `README.md` - Documentation
- `config.json` - Configuration file

### `/edge-cases`
Tests edge cases and nested structures
- `deeply/nested/structure/file.txt` - Deeply nested file
- `special-chars.txt` - File with special characters
- `empty/` - Empty directory (to test exclusion)
- `README.md` - Documentation

## Running Tests

### Prerequisites
- Install pr-cannon: `npm install -g pr-cannon`
- Set GitHub token: `export GITHUB_TOKEN="ghp_..."`
- Have `gh` (GitHub CLI) installed: https://cli.github.com/

### Run All Tests
```bash
./tests/run-tests.sh [owner/repo]
```

Example:
```bash
./tests/run-tests.sh is0692vs/test-pr-cannon
```

The script will:
1. Send single file to target repository
2. Send folder structure to target repository with `--path test-folder`
3. Send edge cases folder to target repository with `--path edge-case-test`
4. Display PR numbers and URLs
5. Save PR numbers to `pr-numbers.txt`

### Cleanup Test PRs
```bash
./tests/cleanup.sh [owner/repo]
```

Example:
```bash
./tests/cleanup.sh is0692vs/test-pr-cannon
```

The script will:
1. Read PR numbers from `pr-numbers.txt`
2. Add a comment to each PR explaining it was a test
3. Close all test PRs automatically
4. Clean up temporary files

## Test Cases Covered

✅ **Single File Sending**
- Basic file upload
- Maintains filename in destination

✅ **Folder Sending**
- Recursive file collection
- Directory structure preservation
- Multiple files in single commit

✅ **Edge Cases**
- Deeply nested directories
- Special characters in filenames
- Empty directories (excluded)
- `.git`, `node_modules` (excluded)
- Hidden files (excluded)

## Feature: Issue #7 - Folder/Directory Sending

This test suite validates the implementation of:
- Recursive directory traversal with `collectFilesRecursively()`
- File filtering with pattern exclusion via `shouldExclude()`
- Multiple file reading with relative path preservation via `readMultipleFiles()`
- GitHub Tree API for efficient multi-file commits

## Notes

- Test PRs are created in the specified repository
- The `cleanup.sh` script safely closes test PRs with explanatory comments
- All test files are organized in subdirectories for clarity
- Empty directories are automatically excluded (as per feature requirements)
- Hidden files and common exclusions (.git, node_modules) are filtered out
