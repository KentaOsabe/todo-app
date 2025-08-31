# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Conversation Guidelines

- 常に日本語で会話する
- コミットメッセージおよびPR（タイトル・説明）は日本語で記載する

## Development Methodology

### Test-Driven Development (TDD)

**CRITICAL**: 新機能やコンポーネントを追加する際は必ずTDD手法に従うこと。

#### TDD実装手順
1. **Red**: まずテストを書き、失敗することを確認
2. **Green**: テストが通る最小限の実装を行う
3. **Refactor**: コードを改善し、テストが通ることを確認
4. **Repeat**: 機能が完成するまで繰り返す

#### 開発完了基準
機能実装完了の判定には以下の段階すべてをクリアすること：

##### Frontend機能の場合
1. **開発** - 機能実装
2. **単体テスト** - Vitestでの Unit Test 合格
3. **E2Eテスト** - PlaywrightでのE2E Test合格
4. **Lintチェック** - ESLintでコード品質確認（エラーゼロ）
5. **Formatチェック** - Prettierでコードフォーマット確認（適正フォーマット）

##### Backend機能の場合
1. **開発** - 機能実装（モデル・コントローラー・API）
2. **単体テスト** - Rails Minitestでの Model/Controller Test 合格
3. **マイグレーション** - データベーススキーマ変更の実行・確認
4. **シードデータ** - 必要に応じてseeds.rbの更新・実行
5. **API動作確認** - APIエンドポイントの手動確認（curl等）

##### Full Stack機能の場合
- Frontend・Backend両方の完了基準をクリア
- フロントエンド・バックエンド間の連携動作確認

#### TDD適用範囲

##### Frontend
- 新しいReactコンポーネントの作成
- カスタムフックの実装
- ユーティリティ関数の追加
- 既存機能の拡張や変更

##### Backend
- 新しいRailsモデルの作成
- Railsコントローラー・APIエンドポイントの実装
- ActiveRecordアソシエーション・バリデーションの追加
- データベースマイグレーションを伴う機能変更

#### テスト種別

##### Frontend
- **Unit Tests**: Vitestを使用したコンポーネント・フック・関数のテスト
- **E2E Tests**: Playwrightを使用したユーザーシナリオのテスト
- テストは`frontend/__tests__/`ディレクトリに配置

##### Backend
- **Model Tests**: Rails Minitestを使用したモデル・バリデーション・アソシエーションのテスト
- **Controller Tests**: APIエンドポイントのリクエスト・レスポンステスト
- **Integration Tests**: 複数のコンポーネント間の連携テスト
- テストは`backend/test/`ディレクトリに配置（models/, controllers/等）

## Development Commands

### Docker Development（推奨）

**CRITICAL**: このプロジェクトはDockerでの開発を前提としています。ビルド、アプリ起動、テスト実行は必ずDockerコマンドを使用すること。詳細は`Docker.md`を参照してください。

**必須**: ローカルのnpmコマンド・railsコマンドは使用せず、以下のDockerコマンドを使用：

**例外**: E2Eテストのみローカル実行（Docker.md参照）：
- `npm run test:e2e` - E2Eテストをローカルで実行（要アプリ起動）
- `npm run test:e2e:ui` - E2EテストをUI付きで実行

#### Frontend Development
- `docker compose up -d frontend` - Start containerized development server on localhost:5173
- `docker compose build --no-cache frontend` - Rebuild with new dependencies
- `docker compose logs -f frontend` - View application logs

#### Backend Development
- `docker compose up -d backend mysql` - Start Rails API server on localhost:3001
- `docker compose run --rm backend rails console` - Open Rails console
- `docker compose run --rm backend rails db:migrate` - Run database migrations
- `docker compose run --rm backend rails db:seed` - Seed database with test data
- `docker compose logs -f backend` - View Rails application logs

#### Full Stack Development
- `docker compose up -d` - Start all services (frontend + backend + MySQL)
- `docker compose down` - Stop all containers

### Docker Testing

#### Frontend Testing（既存コンテナでexec実行）
- `docker compose exec frontend npm run test:run` - Run Vitest unit tests once
- `docker compose exec frontend npm run test` - Run unit tests in watch mode
- E2E（ローカル実行推奨）: `npm run test:e2e` / `npm run test:e2e:ui`（要アプリ起動）

#### Backend Testing（既存コンテナでexec実行）
- `docker compose exec backend rails test` - Run all Rails tests
- `docker compose exec backend rails test --verbose` - Run Rails tests with detailed output
- `docker compose exec backend rails test test/models/` - Run only model tests
- `docker compose exec backend rails db:test:prepare` - Prepare test database

### Docker Code Quality（既存コンテナでexec実行）

- `docker compose exec frontend npm run lint` - Run ESLint to check code quality
- `docker compose exec frontend npm run lint:fix` - Run ESLint with auto-fix
- `docker compose exec frontend npm run format` - Format code with Prettier
- `docker compose exec frontend npm run format:check` - Check code formatting

### Commit / PR ガイドライン

- 言語: コミットメッセージ、PRタイトル・説明は日本語で記載する
- コミットメッセージの構成（推奨）:
  - 1行目: 要約（例: "docs: Dockerコマンドをfrontendに統一"）
  - 本文: 変更理由・詳細・影響範囲（箇条書き可）
- PR説明の構成（推奨）:
  - 概要 / 変更点 / 背景・目的 / 注意点（破壊的変更があれば明記）

### Local Development（非推奨）

直接ローカル環境で実行する場合（依存関係の不整合リスクあり）：

- `npm run dev` - Start Vite development server on localhost:5173
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint on the codebase
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run preview` - Preview production build locally
- `npm run test` - Run Vitest unit tests in watch mode
- `npm run test:run` - Run Vitest unit tests once
- `npm run test:ui` - Launch Vitest UI for interactive testing
- `npm run test:e2e` - Run Playwright E2E tests (requires dev server running)
- `npm run test:e2e:ui` - Run Playwright tests with UI mode

## Architecture Overview

### Technology Stack

#### Frontend
- **React 19.1.0** with TypeScript 5.8.2
- **Vite** for build tooling and development server
- **Vitest** for unit testing with jsdom environment
- **Playwright** for E2E testing across Chromium, Firefox, and WebKit
- **ESLint** for code linting

#### Backend
- **Ruby on Rails 8.0.2** with Ruby 3.4.5
- **MySQL 8.0.43** for database
- **Minitest** for Rails testing framework
- **Docker** for containerized development environment

### Project Structure

This is a TDD-developed full-stack Todo application with the following architecture:

#### Frontend Architecture (React)

- `TodoApp` - Main application component managing global todo state
- `TodoItem` - Individual todo item component with completion and deletion handlers
- State is managed locally in `TodoApp` using React's `useState`
- Props are passed down for todo operations (toggle completion, delete)

#### Backend Architecture (Rails API)

- **Models**: `Category` and `Todo` with ActiveRecord associations
- **Database Schema**: MySQL with proper constraints and foreign keys
- **API Endpoints**: RESTful JSON API for frontend communication
- **Authentication**: Rails credentials for secure configuration management

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

**CRITICAL**: 新しいテストファイルを作成する際は、必ず各テストケースに以下の形式でコメントを記載すること：

###### Frontend Tests (*.test.ts, *.test.tsx)
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

###### Backend Tests (Rails Minitest)
```ruby
# 概要: テストの概要説明
# 目的: テストの目的・確認したい動作
test "test description" do
  # テスト実装
end
```

例：
```ruby
# 概要: 有効な属性でCategoryモデルのバリデーションが通ることをテスト
# 目的: 基本的なCategory作成が正常に動作することを保証
test "should be valid with valid attributes" do
  # テスト実装
end
```

この規約により、テストの意図と期待する動作が明確になり、将来のメンテナンスが容易になる。

#### テストファイル配置規約

##### Frontend Tests
**CRITICAL**: 全てのフロントエンドテストファイル（*.test.ts, *.test.tsx）は必ず`frontend/__tests__`ディレクトリ配下に配置すること：

- フックのテスト: `frontend/__tests__/hooks/`
- コンポーネントのテスト: `frontend/__tests__/components/`
- ユーティリティのテスト: `frontend/__tests__/utils/`
- E2Eテスト: `frontend/__tests__/e2e/`

```
frontend/__tests__/
├── hooks/
│   ├── useTodoSorting.test.ts
│   └── useFilters.test.ts
├── components/
│   ├── TodoApp.test.tsx
│   └── TodoItem.test.tsx
├── utils/
│   └── filterLogic.test.ts
└── e2e/
    └── todo-app.spec.ts
```

##### Backend Tests
**CRITICAL**: 全てのバックエンドテストファイル（*_test.rb）は`backend/test`ディレクトリ配下に配置すること：

- モデルテスト: `backend/test/models/`
- コントローラーテスト: `backend/test/controllers/`
- インテグレーションテスト: `backend/test/integration/`
- フィクスチャー: `backend/test/fixtures/`

```
backend/test/
├── models/
│   ├── category_test.rb
│   └── todo_test.rb
├── controllers/
│   ├── categories_controller_test.rb
│   └── todos_controller_test.rb
├── fixtures/
│   ├── categories.yml
│   └── todos.yml
└── test_helper.rb
```

この規約により、テストコードが整理され、メンテナンスが容易になる。

#### テストケース設計原則

**CRITICAL**: TDD実装において、テストケースは以下の原則に従って設計すること：

- **要件ベース**: GitHub Issueや仕様書の要件に基づいてテストケースを作成
- **最小限の機能担保**: 複雑すぎず、要件を満たす必要最小限の機能を担保する
- **実装詳細に非依存**: UIの詳細な実装方法ではなく、ユーザーの期待動作を検証
- **明確な目的**: 各テストケースが何を保証するのかを明確にする

例：
```typescript
// ❌ 実装詳細に依存したテスト
it('renders ListItemText with Typography components', () => {
  // Material UIの内部構造をテスト
})

// ✅ 要件に基づいたテスト
it('displays all categories with names', () => {
  // ユーザーがカテゴリ名を確認できることを保証
})
```

この原則により、保守性が高く、要件変更に強いテストコードが実現される。

### Development Environment

#### VSCode Integration

- Launch configurations for debugging React app, tests, and Docker containers
- Chrome debugging support with source maps
- Vitest and Playwright debugging configurations
- Auto-formatting with Prettier and ESLint integration

#### Docker Setup

- Development environment runs on Node.js 22.18.0 Alpine
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
