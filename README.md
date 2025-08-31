# Todo App

React + TypeScript + Vite のフロントエンドと Ruby on Rails API のバックエンドで構築されたフルスタックTodoアプリケーションです。カテゴリ管理、フィルタリング、ダークモード対応などの機能を持ちます。

## プロジェクト構造

```
todo-app/
├── frontend/           # Reactアプリケーション
│   ├── src/           # ソースコード
│   ├── __tests__/     # テストファイル
│   ├── public/        # 静的ファイル
│   └── ...           # 設定ファイル等
├── backend/            # Ruby on Rails APIサーバー
│   ├── app/          # Rails アプリケーションコード
│   ├── config/       # Rails 設定ファイル
│   ├── db/           # マイグレーション・スキーマ
│   ├── test/         # Rails テストファイル
│   └── ...           # Rails標準ディレクトリ
├── Dockerfile.frontend # Reactアプリ用Dockerfile
├── Dockerfile.backend  # Rails API用Dockerfile
├── docker-compose.yml  # Docker Compose設定
├── MySQL.md           # MySQL環境構築ガイド
├── Docker.md          # Docker開発ガイド
└── README.md          # このファイル
```

## 開発環境の起動

### Docker環境（推奨）

```bash
# フロントエンドのみ起動
docker compose up -d frontend

# フルスタック起動（フロントエンド + バックエンド + MySQL）
docker compose up -d

# バックエンドのみ起動（API開発用）
docker compose up -d backend mysql
```

詳細な開発手順は [Docker.md](Docker.md) を参照してください。

### ローカル環境

#### フロントエンド
```bash
cd frontend/
npm install
npm run dev
```

#### バックエンド
```bash
cd backend/
bundle install
bin/rails db:setup
bin/rails server
```

**注意**: ローカル開発は依存関係の問題が生じる可能性があるため、Dockerでの開発を推奨します。

## 主な機能

- Todo項目の作成・編集・削除・完了状態切り替え
- カテゴリによるTodo分類と管理
- フィルタリング・検索機能
- ドラッグ&ドロップによる並び替え
- ダークモード対応
- レスポンシブデザイン
- MySQL データベースによる永続化
- RESTful API による フロントエンド・バックエンド連携

## 技術スタック

### フロントエンド
- **React 19.1.0** + TypeScript 5.8.2
- **Vite** - ビルドツール
- **Material-UI** - UIコンポーネント
- **React Router** - ルーティング
- **Vitest** - 単体テスト
- **Playwright** - E2Eテスト

### バックエンド
- **Ruby on Rails 8.0.2** + Ruby 3.4.5
- **MySQL 8.0.43** - データベース
- **Minitest** - Rails テストフレームワーク

### インフラ
- **Docker** + **Docker Compose** - 開発環境
- **Node.js 22.18.0** Alpine - フロントエンドコンテナ
- **Ruby 3.4.5** - バックエンドコンテナ

## 開発状況

- ✅ **フロントエンド**: React + TypeScript + Vite 構成完了
- ✅ **バックエンド**: Ruby on Rails API + MySQL データベース構成完了
- ✅ **データベーススキーマ**: Category・Todo テーブル実装完了（[Issue #23](https://github.com/KentaOsabe/todo-app/issues/23)）
- 🔄 **API 連携**: フロントエンド・バックエンド間の API 通信実装予定
- 🔄 **認証機能**: ユーザー認証・認可機能の実装予定

## テスト実行

### フロントエンドテスト
```bash
# 単体テスト
docker compose exec frontend npm run test:run

# E2Eテスト（アプリ起動後）
npm run test:e2e
```

### バックエンドテスト
```bash
# Rails テスト
docker compose run --rm backend rails test

# テストデータベース準備
docker compose run --rm backend rails db:test:prepare
```
