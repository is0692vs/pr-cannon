#!/bin/bash

# pr-cannon Folder Sending Feature Test Script
# This script tests both single file and folder sending functionality

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO="${1:-is0692vs/test-pr-cannon}"
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_FILE="${TEST_DIR}/test-results.json"

echo -e "${BLUE}🧪 PR Cannon Folder Sending Feature Test${NC}\n"
echo "Repository: ${REPO}"
echo "Test Directory: ${TEST_DIR}"
echo ""

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${RED}❌ GITHUB_TOKEN environment variable not set${NC}"
  exit 1
fi

# Check if pr-cannon is installed
if ! command -v prca &> /dev/null; then
  echo -e "${RED}❌ pr-cannon (prca) is not installed${NC}"
  echo "Install with: npm install -g pr-cannon"
  exit 1
fi

# Initialize results
declare -a PR_NUMBERS
PR_INDEX=0

# Test 1: Single file sending
echo -e "${YELLOW}📝 Test 1: Single File Sending${NC}"
if [ -f "${TEST_DIR}/single-file/sample.md" ]; then
  echo "Sending: ${TEST_DIR}/single-file/sample.md"
  OUTPUT=$(prca fire "${TEST_DIR}/single-file/sample.md" "${REPO}" 2>&1 || echo "FAILED")
  
  if echo "$OUTPUT" | grep -q "Pull request created: #"; then
    PR_NUM=$(echo "$OUTPUT" | grep "Pull request created: #" | grep -oE "#[0-9]+" | sed 's/#//')
    echo -e "${GREEN}✅ PR #${PR_NUM} created${NC}"
    PR_NUMBERS[$PR_INDEX]=$PR_NUM
    ((PR_INDEX++))
  else
    echo -e "${RED}❌ Failed to create PR${NC}"
    echo "$OUTPUT"
  fi
else
  echo -e "${RED}❌ Test file not found${NC}"
fi

echo ""

# Test 2: Folder sending
echo -e "${YELLOW}📁 Test 2: Folder Structure Sending${NC}"
if [ -d "${TEST_DIR}/folder-structure" ]; then
  echo "Sending: ${TEST_DIR}/folder-structure"
  OUTPUT=$(prca fire "${TEST_DIR}/folder-structure" "${REPO}" --path test-folder 2>&1 || echo "FAILED")
  
  if echo "$OUTPUT" | grep -q "Pull request created: #"; then
    PR_NUM=$(echo "$OUTPUT" | grep "Pull request created: #" | grep -oE "#[0-9]+" | sed 's/#//')
    echo -e "${GREEN}✅ PR #${PR_NUM} created${NC}"
    PR_NUMBERS[$PR_INDEX]=$PR_NUM
    ((PR_INDEX++))
  else
    echo -e "${RED}❌ Failed to create PR${NC}"
    echo "$OUTPUT"
  fi
else
  echo -e "${RED}❌ Test folder not found${NC}"
fi

echo ""

# Test 3: Edge cases
echo -e "${YELLOW}🔧 Test 3: Edge Cases (Nested Structure)${NC}"
if [ -d "${TEST_DIR}/edge-cases" ]; then
  echo "Sending: ${TEST_DIR}/edge-cases"
  OUTPUT=$(prca fire "${TEST_DIR}/edge-cases" "${REPO}" --path edge-case-test 2>&1 || echo "FAILED")
  
  if echo "$OUTPUT" | grep -q "Pull request created: #"; then
    PR_NUM=$(echo "$OUTPUT" | grep "Pull request created: #" | grep -oE "#[0-9]+" | sed 's/#//')
    echo -e "${GREEN}✅ PR #${PR_NUM} created${NC}"
    PR_NUMBERS[$PR_INDEX]=$PR_NUM
    ((PR_INDEX++))
  else
    echo -e "${RED}❌ Failed to create PR${NC}"
    echo "$OUTPUT"
  fi
else
  echo -e "${RED}❌ Test folder not found${NC}"
fi

echo ""
echo -e "${BLUE}📊 Test Summary${NC}"
echo "Total PRs created: ${#PR_NUMBERS[@]}"
echo "PR Numbers: ${PR_NUMBERS[@]}"

# Save results for cleanup script
echo "${PR_NUMBERS[@]}" > "${TEST_DIR}/pr-numbers.txt"

echo -e "${GREEN}✅ Tests completed!${NC}"
echo -e "${YELLOW}💡 Run './tests/cleanup.sh' to close all test PRs${NC}"
