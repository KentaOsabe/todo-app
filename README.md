# React Todo App

React + TypeScript + Viteで構築されたTodoアプリケーションです。カテゴリ管理、フィルタリング、ダークモード対応などの機能を持ちます。

## プロジェクト構造

```
todo-app/
├── frontend/           # Reactアプリケーション
│   ├── src/           # ソースコード
│   ├── __tests__/     # テストファイル
│   ├── public/        # 静的ファイル
│   └── ...           # 設定ファイル等
├── Dockerfile.frontend # Reactアプリ用Dockerfile
├── docker-compose.yml  # Docker Compose設定
└── README.md          # このファイル
```

## 開発環境の起動

### Docker環境（推奨）

```bash
# アプリケーション起動
docker compose up -d app

# テスト実行
docker compose --profile test run --rm test

# E2Eテスト実行（要アプリ起動）
docker compose --profile e2e run --rm e2e
```

### ローカル環境

```bash
cd frontend/
npm install
npm run dev
```

## 主な機能

- Todo項目の作成・編集・削除・完了状態切り替え
- カテゴリによるTodo分類
- フィルタリング・検索機能
- ドラッグ&ドロップによる並び替え
- ダークモード対応
- レスポンシブデザイン

## 技術スタック

- **React 19.1.0** + TypeScript
- **Vite** - ビルドツール
- **Material-UI** - UIコンポーネント
- **React Router** - ルーティング
- **Vitest** - 単体テスト
- **Playwright** - E2Eテスト

## 今後の予定

LocalStorageからMySQL + Ruby on Rails APIサーバーへの移行を計画中。
詳細は [Issue #19](https://github.com/KentaOsabe/react-todo/issues/19) を参照。
