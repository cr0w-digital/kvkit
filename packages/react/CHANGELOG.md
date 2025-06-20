# @kvkit/react

## 0.4.0

### Minor Changes

- [`23c1bda`](https://github.com/cr0w-digital/kvkit/commit/23c1bda2c0ea9426b56c03085b8da60e91bc337c) Thanks [@cr0w-denny](https://github.com/cr0w-denny)! - feat: Overhaul React hooks and query utilities for robust, testable URL state management.

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

### Patch Changes

- Updated dependencies [[`23c1bda`](https://github.com/cr0w-digital/kvkit/commit/23c1bda2c0ea9426b56c03085b8da60e91bc337c)]:
  - @kvkit/query@0.3.0
  - @kvkit/codecs@0.2.1

## 0.3.0

### Minor Changes

- [`5c004ff`](https://github.com/cr0w-digital/kvkit/commit/5c004ff2f890eecd6fe26d7c0c0b454cec20169d) Thanks [@cr0w-denny](https://github.com/cr0w-denny)! - Add hash routing support for SPAs

  - Add `hashRouting` option to `UrlSyncOptions` for handling `#/path?param=value` URLs
  - Add `useHashRoutingParams` hook as convenience wrapper for hash routing scenarios
  - Hash routing preserves the path portion while updating only query parameters
  - Comprehensive unit tests covering hash parsing, path preservation, and edge cases
  - Updated examples and documentation with hash routing demonstrations

## 0.2.0

### Minor Changes

- f6c6a5d: Initial release of kvkit packages with comprehensive React demo

  This is the first release of kvkit, featuring:

  - **@kvkit/codecs**: Core codec implementations for type-safe data serialization

    - JSON codec for complex objects
    - Flat codec for form-like data
    - Prefix codec for namespaced parameters
    - Simple value codecs (string, number, boolean, date, arrays)

  - **@kvkit/query**: URL and query string utilities

    - Encode/decode data to/from URLSearchParams
    - Browser history management
    - Server-side compatible utilities

  - **@kvkit/react**: React hooks for state synchronization
    - useSearchParams for URL search parameter sync
    - useHashParams for URL hash parameter sync
    - useLocalStorageCodec for persistent storage
    - Full TypeScript support

  All packages include comprehensive documentation, examples, and a complete React demo showcasing real-world usage patterns.

### Patch Changes

- Updated dependencies [f6c6a5d]
  - @kvkit/codecs@0.2.0
