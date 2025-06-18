# Contributing to kvkit

We welcome contributions to kvkit! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm (version 8 or higher)
- Git

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/kvkit.git
   cd kvkit
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build all packages:
   ```bash
   npm run build
   ```

5. Run tests to ensure everything is working:
   ```bash
   npm test
   ```

## Project Structure

```
kvkit/
├── packages/
│   ├── codecs/          # Core codec implementations
│   ├── query/           # URL and query utilities
│   └── react/           # React hooks
├── examples/
│   └── react/           # React demo application
├── example.ts           # Basic usage examples
└── README.md
```

## Development Workflow

### Making Changes

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in the appropriate package(s)

3. Add or update tests for your changes

4. Run tests to ensure everything passes:
   ```bash
   npm test
   ```

5. Build the project to check for compilation errors:
   ```bash
   npm run build
   ```

6. Test the React demo if you made changes affecting React hooks:
   ```bash
   npm run demo:react
   ```

### Package-Specific Development

Each package has its own development commands:

```bash
# Work on a specific package
cd packages/codecs
npm run dev          # Watch mode for TypeScript compilation
npm run test:watch   # Watch mode for tests

# Test individual packages
npm run test --workspace packages/codecs
npm run test --workspace packages/query
npm run test --workspace packages/react
```

## Code Style and Standards

### TypeScript

- Use TypeScript for all code
- Provide proper type definitions
- Export types that consumers might need
- Use strict TypeScript configuration

### Code Formatting

- We use TypeScript's built-in formatting
- Ensure your editor follows the project's TypeScript configuration
- Run `npm run typecheck` to verify type correctness

### Testing

- Write tests for new features and bug fixes
- Use Vitest for testing framework
- Aim for good test coverage
- Include both unit tests and integration tests where appropriate

Example test structure:
```typescript
import { describe, it, expect } from 'vitest';
import { flatCodec } from '../src/index.js';

describe('flatCodec', () => {
  it('should encode and decode flat objects', () => {
    const codec = flatCodec<{ name: string; age: number }>();
    const input = { name: 'John', age: 30 };
    
    const encoded = codec.encode(input);
    const decoded = codec.decode(encoded);
    
    expect(decoded).toEqual(input);
  });
});
```

## Documentation

### Code Documentation

- Use JSDoc comments for public APIs
- Include examples in documentation where helpful
- Document complex algorithms or non-obvious code

### README Updates

- Update package READMEs when adding new features
- Include usage examples
- Update the root README if adding new packages or major features

## Submitting Changes

### Pull Request Process

1. Ensure your branch is up to date with main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. Push your changes to your fork:
   ```bash
   git push origin your-branch
   ```

3. Create a pull request on GitHub with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Reference any related issues

### Commit Message Format

We use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Scopes:**
- `codecs`: Changes to @kvkit/codecs
- `query`: Changes to @kvkit/query
- `react`: Changes to @kvkit/react
- `demo`: Changes to React demo
- `build`: Build system changes

**Examples:**
```
feat(codecs): add dateCodec for Date serialization
fix(react): handle localStorage quota exceeded errors
docs(query): add examples for updateQuery function
refactor(codecs): simplify flatCodec implementation
test(react): add tests for useHashParams hook
chore: update dependencies
```

## Release Process

Releases are handled by maintainers:

1. Version bumping follows semantic versioning
2. Packages are published to npm with `@kvkit/` scope
3. Changelog is updated with notable changes
4. Git tags are created for releases

## Issue Guidelines

### Reporting Bugs

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, browser, etc.)
- Minimal code example if possible

### Feature Requests

For feature requests, please:
- Describe the use case
- Explain why it would be valuable
- Consider if it fits kvkit's philosophy of being lightweight and composable
- Provide examples of the proposed API

## Code of Conduct

- Be respectful and constructive in discussions
- Help create a welcoming environment for all contributors
- Focus on what's best for the community and the project

## Questions?

- Open an issue for questions about contributing
- Check existing issues and discussions first
- Be specific about what you need help with

## License

By contributing to kvkit, you agree that your contributions will be licensed under the MIT License.
