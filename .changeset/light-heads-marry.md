---
"@kvkit/query": minor
"@kvkit/react": minor
"@kvkit/codecs": patch
---

feat: Overhaul React hooks and query utilities for robust, testable URL state management.

This release introduces a significant refactor to `@kvkit/react` and `@kvkit/query` to improve functionality, testing, and maintainability.

**Key Changes:**

- **`@kvkit/react`:**
  - Fixed `useUrlSyncedState` to correctly handle `popstate` events, JSDOM security errors, and asynchronous updates.
  - Refactored `useUrlSyncedState` to delegate all URL manipulation to the `@kvkit/query` package, removing code duplication.

- **`@kvkit/query`:**
  - Centralized all URL search and hash parameter logic.
  - Added support for hash-based routing and improved the `decodeFromQuery` and `updateQuery` functions.
  - Fixed all tests to align with the new, more robust implementation.

- **`@kvkit/codecs`:**
  - No functional changes, but included in the changeset to ensure version consistency across the workspace.

- **Build & Test:**
  - Configured a unified testing environment with a root `vitest.config.ts` and a shared `setup-tests.ts` file.
  - Removed a redundant, unused test setup file to clean up the project structure.
