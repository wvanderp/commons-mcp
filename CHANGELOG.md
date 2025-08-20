# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI/CD workflow for automated testing and publishing
- TypeScript ESLint support for better code quality
- Enhanced CLI with help text and better error handling
- Comprehensive package.json metadata for npm publishing
- MIT License file
- Detailed README with installation instructions and examples
- Changelog for tracking project changes

### Changed
- Improved documentation structure and clarity
- Enhanced code quality with proper TypeScript types
- Replaced `any` types with specific TypeScript interfaces for MediaWiki API
- Updated CLI output format with better formatting and metadata display
- Modified .gitignore to include dist folder for npm publishing

### Fixed
- ESLint configuration now properly supports TypeScript files
- CLI now handles edge cases and provides proper help text
- Code formatting standardized with Prettier

## [0.1.0] - Initial Release

### Added
- Basic MCP server for searching Wikimedia Commons
- `search_commons` tool with query and limit parameters
- CLI interface for testing
- TypeScript implementation with Node.js
- VS Code MCP integration support
- Basic test suite with network-dependent integration tests