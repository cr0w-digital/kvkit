---
"@kvkit/react": minor
---

Add hash routing support for SPAs

- Add `hashRouting` option to `UrlSyncOptions` for handling `#/path?param=value` URLs
- Add `useHashRoutingParams` hook as convenience wrapper for hash routing scenarios  
- Hash routing preserves the path portion while updating only query parameters
- Comprehensive unit tests covering hash parsing, path preservation, and edge cases
- Updated examples and documentation with hash routing demonstrations
