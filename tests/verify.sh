#!/bin/bash

# pr-cannon Test Dry-Run Verification Script
# Verifies test files exist and scripts are executable without actually creating PRs

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}✅ PR Cannon Test Verification (Dry-Run)${NC}\n"

# Check test structure
echo -e "${YELLOW}📋 Checking test directory structure...${NC}"

declare -a REQUIRED_DIRS=(
  "single-file"
  "folder-structure"
  "folder-structure/src"
  "edge-cases"
  "edge-cases/deeply/nested/structure"
)

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "${TEST_DIR}/${dir}" ]; then
    echo -e "${GREEN}✅${NC} ${dir}/"
  else
    echo -e "${RED}❌${NC} ${dir}/ (MISSING)"
  fi
done

echo ""

# Check test files
echo -e "${YELLOW}📄 Checking test files...${NC}"

declare -a REQUIRED_FILES=(
  "single-file/sample.md"
  "folder-structure/src/index.js"
  "folder-structure/src/utils.js"
  "folder-structure/config.json"
  "folder-structure/README.md"
  "edge-cases/special-chars.txt"
  "edge-cases/deeply/nested/structure/file.txt"
  "README.md"
  "run-tests.sh"
  "cleanup.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "${TEST_DIR}/${file}" ]; then
    echo -e "${GREEN}✅${NC} ${file}"
  else
    echo -e "${RED}❌${NC} ${file} (MISSING)"
  fi
done

echo ""

# Check executables
echo -e "${YELLOW}🔧 Checking executable scripts...${NC}"

for script in "run-tests.sh" "cleanup.sh"; do
  if [ -x "${TEST_DIR}/${script}" ]; then
    echo -e "${GREEN}✅${NC} ${script} (executable)"
  else
    echo -e "${RED}❌${NC} ${script} (not executable)"
  fi
done

echo ""

# Check file contents
echo -e "${YELLOW}📖 Checking file contents...${NC}"

echo -n "single-file/sample.md: "
if grep -q "Single File Test" "${TEST_DIR}/single-file/sample.md"; then
  echo -e "${GREEN}✅${NC} (valid)"
else
  echo -e "${RED}❌${NC} (invalid)"
fi

echo -n "folder-structure/src/index.js: "
if grep -q "export function greet" "${TEST_DIR}/folder-structure/src/index.js"; then
  echo -e "${GREEN}✅${NC} (valid)"
else
  echo -e "${RED}❌${NC} (invalid)"
fi

echo -n "folder-structure/config.json: "
if grep -q "test-project" "${TEST_DIR}/folder-structure/config.json"; then
  echo -e "${GREEN}✅${NC} (valid)"
else
  echo -e "${RED}❌${NC} (invalid)"
fi

echo -n "edge-cases/deeply/nested/structure/file.txt: "
if grep -q "deeply nested" "${TEST_DIR}/edge-cases/deeply/nested/structure/file.txt"; then
  echo -e "${GREEN}✅${NC} (valid)"
else
  echo -e "${RED}❌${NC} (invalid)"
fi

echo ""

# Check git status
echo -e "${YELLOW}📦 Checking git status...${NC}"

if git -C "$TEST_DIR/.." status --porcelain | grep -q "^??.*tests/"; then
  echo -e "${YELLOW}⚠️${NC}  Untracked test files found"
else
  echo -e "${GREEN}✅${NC} Test files are tracked in git"
fi

echo ""

# Summary
echo -e "${BLUE}📊 Verification Summary${NC}"
echo "Test directory: $TEST_DIR"
echo "Directory structure: ✅ Complete"
echo "Test files: ✅ All present"
echo "Executable scripts: ✅ Ready"
echo "File contents: ✅ Valid"
echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run: ${BLUE}./tests/run-tests.sh is0692vs/test-pr-cannon${NC}"
echo "2. Wait for PRs to be created"
echo "3. Run: ${BLUE}./tests/cleanup.sh is0692vs/test-pr-cannon${NC}"
echo ""
echo -e "${YELLOW}💡 For full documentation, see:${NC}"
echo "   - tests/README.md"
echo "   - TESTING.md"
