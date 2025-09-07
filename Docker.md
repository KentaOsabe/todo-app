# Docker での Todo アプリ起動・停止方法

このドキュメントでは、Docker Compose を使用してTodo アプリケーション（React フロントエンド + Rails API バックエンド）を起動・停止する方法について説明します。

## 前提条件

- Docker がインストールされていること
- Docker Compose がインストールされていること（Docker Desktop に含まれています）

## アプリケーションの起動

### バックグラウンドでの起動（推奨）

アプリケーションをバックグラウンドで起動し、ターミナルを他の作業に使用できるようにします：

```bash
# フロントエンドのみ起動
docker compose up -d frontend

# フロントエンド + バックエンド + MySQL の起動
docker compose up -d

# バックエンドのみ起動（開発・テスト用）
docker compose up -d backend mysql
```

### フォアグラウンドでの起動

ログをリアルタイムで確認したい場合：

```bash
# フロントエンドのログを確認
docker compose up frontend

# 全サービスのログを確認
docker compose up
```

## アプリケーションの確認

アプリケーションが起動したら、以下のURLでアクセスできます：

### フロントエンド（React アプリ）
- **ローカル**: http://localhost:5173/
- **ネットワーク**: http://172.x.x.x:5173/ （コンテナのIPアドレス）

### バックエンド（Rails API）
- **ローカル**: http://localhost:3001/
- **APIエンドポイント例**:
  - `GET http://localhost:3001/api/categories` - カテゴリ一覧
  - `GET http://localhost:3001/api/todos` - Todo一覧

### データベース（MySQL）
- **接続情報**:
  - Host: localhost:3306
  - Database: todo_development
  - Username: todo_user
  - Password: todo_password

## ログの確認

バックグラウンドで起動したアプリケーションのログを確認する場合：

```bash
# 全てのサービスのログを表示
docker compose logs

# フロントエンドのログを表示
docker compose logs frontend

# バックエンドのログを表示
docker compose logs backend

# データベースのログを表示
docker compose logs mysql

# リアルタイムでログを追跡
docker compose logs -f frontend
docker compose logs -f backend
```

## アプリケーションの停止

### バックグラウンドで動作しているアプリケーションの停止

```bash
docker compose down
```

### 特定のサービスのみを停止

```bash
docker compose stop frontend
```

### フォアグラウンドで動作している場合

ターミナルで `Ctrl + C` を押してください。

## その他のコマンド

### アプリケーションの再起動

```bash
docker compose restart frontend
```

### コンテナの状態確認

```bash
docker compose ps
```

### イメージの再ビルド

ソースコードを変更してDockerfileやpackage.jsonを更新した場合：

```bash
docker compose build frontend
docker compose up -d frontend
```

または、ビルドと起動を同時に実行：

```bash
docker compose up -d --build frontend
```

### 依存関係を追加した場合の完全再ビルド

新しいnpmパッケージを追加した場合やpackage.jsonを変更した場合：

```bash
# キャッシュを無効にして完全再ビルド
docker compose build --no-cache frontend
docker compose up -d frontend
```

または、コンテナとボリュームを削除してから再ビルド：

```bash
docker compose down -v
docker compose up -d --build frontend
```

### コンテナとボリュームの完全削除

全てのコンテナ、ネットワーク、ボリュームを削除：

```bash
docker compose down -v
```

## 開発時のワークフロー

1. **初回起動**:
   ```bash
docker compose up -d --build
   ```

2. **日常的な起動**:
   ```bash
docker compose up -d
   ```

3. **ログ確認**:
   ```bash
docker compose logs -f
   ```

4. **停止**:
   ```bash
   docker compose down
   ```

## トラブルシューティング

### ポートが既に使用されている場合

ポート5173が他のプロセスで使用されている場合、`docker-compose.yml`のポート設定を変更してください：

```yaml
services:
  frontend:
    ports:
      - "9000:5173"  # ホストの9000番ポートにマッピング
```

### コンテナが起動しない場合

1. ログを確認：
   ```bash
   docker compose logs
   ```

2. コンテナを再ビルド：
   ```bash
   docker compose build --no-cache
   ```

3. 完全にクリーンアップしてから再起動：
   ```bash
   docker compose down -v
   docker compose up -d --build
   ```

## テストの実行

### フロントエンド テスト

#### 単体テスト（Unit Tests）

Vitestを既存のfrontendコンテナでexec実行：

```bash
# 既にfrontendが起動している前提（未起動なら: docker compose up -d frontend）

# 単体テストを一度だけ実行
docker compose exec frontend npm run test:run

# ウォッチモードでテスト実行
docker compose exec frontend npm run test

# 特定のテストファイルだけを実行（例）
docker compose exec frontend npm run test:run -- __tests__/components/TodoApp.test.tsx
```

#### E2Eテスト（End-to-End Tests）

PlaywrightによるE2EテストはDockerコンテナではなく、ローカル環境で実行することを推奨：

```bash
# アプリケーションをDockerで起動
docker compose up -d

# E2Eテストをローカルで実行（別のターミナル）
npm run test:e2e

# または、UIモードで実行
npm run test:e2e:ui
```

**注意**: E2Eテストはブラウザが必要なため、ローカル環境での実行が推奨されます。

### バックエンド テスト

#### Rails モデル・コントローラテスト

Minitestを使用したRailsテストをDockerコンテナ内で実行：

```bash
# 全てのRailsテストを実行
docker compose run --rm backend rails test

# 特定のテストファイルを実行
docker compose run --rm backend rails test test/models/category_test.rb

# 特定のテストケースを実行
docker compose run --rm backend rails test test/models/todo_test.rb::TodoTest#test_should_require_text

# テスト結果を詳細表示
docker compose run --rm backend rails test --verbose
```

#### データベース関連のテスト準備

テスト実行前にテストデータベースの準備が必要な場合：

```bash
# テストデータベースのセットアップ
docker compose run --rm backend rails db:test:prepare

# テスト用のマイグレーション実行
docker compose run --rm backend rails db:migrate RAILS_ENV=test
```

### テスト用のワークフロー

1. **フロントエンド開発中の継続的テスト**:
   ```bash
   # アプリケーション起動
   docker compose up -d frontend
   
   # 単体テストを監視モードで実行（既存コンテナでexec）
   docker compose exec frontend npm run test

   # ESLintをチェックモードで実行
   docker compose exec frontend npm run lint

   # ESLintを自動修正モードで実行
   docker compose exec frontend npm run lint:fix

   # Prettierによるコードフォーマット実行
   docker compose exec frontend npm run format

   # Prettierによるコードフォーマットチェック
   docker compose exec frontend npm run format:check
   ```

2. **バックエンド開発中の継続的テスト**:
   ```bash
   # バックエンド + データベース起動
   docker compose up -d backend mysql
   
   # Railsテストを実行
   docker compose run --rm backend rails test --verbose
   ```

3. **フルスタック統合テスト**:
   ```bash
   # 全サービス起動
   docker compose up -d
   
   # バックエンドテスト実行（既存コンテナでexec）
   docker compose exec backend rails test
   
   # フロントエンド単体テスト実行（既存コンテナでexec）
   docker compose exec frontend npm run test:run
   
   # E2Eテストをローカルで実行（別のターミナル）
   npm run test:e2e
   ```

4. **CI/CD用の一括テスト**:
   ```bash
   # 全サービスビルド・起動
   docker compose build --no-cache
   docker compose up -d
   
   # バックエンドテスト（既存コンテナでexec）
   docker compose exec backend rails test
   
   # フロントエンドテスト（既存コンテナでexec）
   docker compose exec frontend npm run test:run
   
   # E2Eテスト（別途ローカル環境）
   npm run test:e2e
   docker compose down
   ```

### テストのトラブルシューティング

#### E2Eテストが失敗する場合

1. アプリケーションが完全に起動していることを確認：
   ```bash
   docker compose logs frontend
   curl http://localhost:5173
   ```

2. ローカルでPlaywrightが正しくインストールされていることを確認：
   ```bash
   npx playwright install
   ```

3. ブラウザのUIを確認したい場合：
   ```bash
   npm run test:e2e:ui
   ```

#### 単体テストでモジュールが見つからない場合

依存関係を再インストール：
```bash
docker compose build --no-cache frontend
docker compose exec frontend npm run test:run
```

## Rails 開発コマンド

### データベース操作

```bash
# マイグレーション実行
docker compose run --rm backend rails db:migrate

# シードデータ投入
docker compose run --rm backend rails db:seed

# データベース初期化（危険：全データ削除）
docker compose run --rm backend rails db:drop db:create db:migrate db:seed

# マイグレーション状況確認
docker compose run --rm backend rails db:migrate:status

# 新しいマイグレーション作成
docker compose run --rm backend rails generate migration CreateNewTable
```

### Rails コンソール・ジェネレーター

```bash
# Rails コンソール起動
docker compose run --rm backend rails console

# モデル生成
docker compose run --rm backend rails generate model ModelName attribute:type

# コントローラー生成
docker compose run --rm backend rails generate controller ControllerName

# マイグレーション生成
docker compose run --rm backend rails generate migration AddColumnToTable column:type
```

### Rails ルーティング・設定確認

```bash
# ルーティング一覧表示
docker compose run --rm backend rails routes

# 設定値確認
docker compose run --rm backend rails runner "puts Rails.application.config.database_configuration"

# アプリケーション情報
docker compose run --rm backend rails about
```

## トラブルシューティング

### Rails 固有の問題

#### マイグレーションエラーが発生する場合

```bash
# マイグレーション状況を確認
docker compose run --rm backend rails db:migrate:status

# 特定のマイグレーションをロールバック
docker compose run --rm backend rails db:rollback STEP=1

# 特定のバージョンにロールバック
docker compose run --rm backend rails db:migrate:down VERSION=20250830000001
```

#### データベース接続エラーが発生する場合

```bash
# MySQLサービスの状況確認
docker compose ps mysql
docker compose logs mysql

# MySQL接続テスト
docker compose exec mysql mysql -u todo_user -ptodo_password todo_development -e "SELECT 1"

# データベース再作成
docker compose run --rm backend rails db:drop db:create db:migrate db:seed
```

#### Rails Master Key エラーが発生する場合

```bash
# .envファイルの確認
cat .env

# 新しいRAILS_MASTER_KEYの生成
docker compose run --rm backend ruby -c "require 'securerandom'; puts SecureRandom.hex(16)"

# credentials.yml.encの再生成（注意：既存の設定は失われます）
docker compose run --rm -e EDITOR=nano backend rails credentials:edit
```

## 便利なエイリアス

以下のエイリアスを `.bashrc` や `.zshrc` に追加すると便利です：

```bash
# 基本操作
alias dc="docker compose"
alias dcup="docker compose up -d"
alias dcdown="docker compose down"
alias dclogs="docker compose logs -f"
alias dcps="docker compose ps"

# フロントエンド
alias dctest="docker compose --profile test run --rm test"
alias dce2e="npm run test:e2e"

# バックエンド
alias dcrails="docker compose run --rm backend rails"
alias dcmigrate="docker compose run --rm backend rails db:migrate"
alias dcseed="docker compose run --rm backend rails db:seed"
alias dcconsole="docker compose run --rm backend rails console"
alias dcrtest="docker compose run --rm backend rails test"
```
