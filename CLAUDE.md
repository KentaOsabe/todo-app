# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Conversation Guidelines

- 常に日本語で会話する

## Development Methodology

### Test-Driven Development (TDD)

**CRITICAL**: 新機能やコンポーネントを追加する際は必ずTDD手法に従うこと。

#### TDD実装手順
1. **Red**: まずテストを書き、失敗することを確認
2. **Green**: テストが通る最小限の実装を行う
3. **Refactor**: コードを改善し、テストが通ることを確認
4. **Repeat**: 機能が完成するまで繰り返す

#### TDD適用範囲
- 新しいReactコンポーネントの作成
- カスタムフックの実装
- ユーティリティ関数の追加
- 既存機能の拡張や変更

#### テスト種別
- **Unit Tests**: Vitestを使用したコンポーネント・フック・関数のテスト
- **E2E Tests**: Playwrightを使用したユーザーシナリオのテスト
- テストは機能と同じディレクトリまたは`tests/`ディレクトリに配置

## Development Commands

### Docker Development（推奨）

このプロジェクトはDockerでの開発を前提としています。詳細は`Docker.md`を参照してください。

- `docker compose up -d app` - Start containerized development server on localhost:5173
- `docker compose build --no-cache app` - Rebuild with new dependencies
- `docker compose down` - Stop all containers
- `docker compose logs -f app` - View application logs

### Docker Testing

- `docker compose --profile test run --rm test` - Run Vitest unit tests once
- `docker compose run --rm app npm run test` - Run unit tests in watch mode
- `docker compose --profile e2e run --rm e2e` - Run Playwright E2E tests (requires app running)
- `docker compose run --rm app npm run test:e2e:ui` - Run E2E tests with UI mode

### Local Development（非推奨）

直接ローカル環境で実行する場合（依存関係の不整合リスクあり）：

- `npm run dev` - Start Vite development server on localhost:5173
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build locally
- `npm run test` - Run Vitest unit tests in watch mode
- `npm run test:run` - Run Vitest unit tests once
- `npm run test:ui` - Launch Vitest UI for interactive testing
- `npm run test:e2e` - Run Playwright E2E tests (requires dev server running)
- `npm run test:e2e:ui` - Run Playwright tests with UI mode

## Architecture Overview

### Technology Stack

- **React 19.1.0** with TypeScript 5.8.2
- **Vite** for build tooling and development server
- **Vitest** for unit testing with jsdom environment
- **Playwright** for E2E testing across Chromium, Firefox, and WebKit
- **ESLint** for code linting

### Project Structure

This is a TDD-developed React Todo application with the following architecture:

#### Component Architecture

- `TodoApp` - Main application component managing global todo state
- `TodoItem` - Individual todo item component with completion and deletion handlers
- State is managed locally in `TodoApp` using React's `useState`
- Props are passed down for todo operations (toggle completion, delete)

#### Type System

- `src/types/todo.ts` defines the core `Todo` interface
- Uses `import type` syntax due to `verbatimModuleSyntax` TypeScript configuration
- All components are strictly typed with proper interfaces

#### Testing Strategy

- **Unit Tests**: Located alongside components (`.test.tsx` files)
- **E2E Tests**: Located in `tests/` directory
- Test files include detailed comments explaining test purpose and goals
- Full coverage of user interactions and edge cases

##### Test File Documentation Requirements

**CRITICAL**: 新しいテストファイル（*.test.ts, *.test.tsx）を作成する際は、必ず各テストケースに以下の形式でコメントを記載すること：

```typescript
// 概要: テストの概要説明
// 目的: テストの目的・確認したい動作
it('test description', () => {
  // テスト実装
})
```

例：
```typescript
// 概要: 初期状態でシステム設定を検出することをテスト
// 目的: ユーザーのシステム設定（ダークモード）を自動検出することを保証
it('detects system dark mode preference initially', () => {
  // テスト実装
})
```

この規約により、テストの意図と期待する動作が明確になり、将来のメンテナンスが容易になる。

### Development Environment

#### VSCode Integration

- Launch configurations for debugging React app, tests, and Docker containers
- Chrome debugging support with source maps
- Vitest and Playwright debugging configurations
- Auto-formatting with Prettier and ESLint integration

#### Docker Setup

- Development environment runs on Node.js 22.17.0 Alpine
- Hot reload enabled with volume mounting
- Debug port 9229 exposed for remote debugging
- Separate profiles for testing environments

### Key Implementation Details

#### Type Import Requirements

- This project uses TypeScript's `verbatimModuleSyntax`
- Always use `import type { Todo } from '../types/todo'` for type-only imports
- Regular imports should be used only for runtime values

#### Test Environment

- Vitest configured with jsdom environment for React testing
- `@testing-library/react` and `@testing-library/jest-dom` for component testing
- Playwright E2E tests expect dev server to be running on localhost:5173
- E2E tests include comprehensive scenarios with detailed comments

#### Build Configuration

- Vite handles both development and production builds
- TypeScript compilation happens before Vite build in production
- Source maps enabled for debugging in all environments
