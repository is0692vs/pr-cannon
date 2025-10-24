# Changelog

## [0.4.0] - 2025-10-25

### Added
- **Auto-merge option**: `--auto-merge` / `-m` flag to automatically merge PR after creation
  - Only works if you are the repository owner
  - Checks for merge conflicts before merging
  - Provides clear feedback on merge status
- Comprehensive error handling for merge failures (conflicts, permission issues)

### Technical Details
- Added `getAuthenticatedUser()` to retrieve current GitHub user
- Added `isRepoOwner()` to verify repository ownership
- Added `mergePullRequest()` with 405/409 error handling
- Tested with PRs #48-#52: single files, multiple files, and backwards compatibility

## [0.3.0] - 2025-10-23

### Added
- Multiple files and folders can be specified in a single command
- All specified paths are combined into one PR

## [0.2.0] - 2025-10-23

### Added
- Folder sending functionality with recursive directory traversal
- Automatic exclusion of `.git`, `node_modules`, `.DS_Store`, and hidden files

## [0.1.1] - 2025-10-23

### Added
- Short command alias `prca` for easier typing

## [0.1.0] - 2025-10-23

### Added
- Initial release
- Basic file sending to GitHub repositories as PRs
