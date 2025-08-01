# Docker での React Todo アプリ起動・停止方法

このドキュメントでは、Docker Compose を使用してReact Todo アプリケーションを起動・停止する方法について説明します。

## 前提条件

- Docker がインストールされていること
- Docker Compose がインストールされていること（Docker Desktop に含まれています）

## アプリケーションの起動

### バックグラウンドでの起動（推奨）

アプリケーションをバックグラウンドで起動し、ターミナルを他の作業に使用できるようにします：

```bash
docker compose up -d app
```

または、全てのサービスをバックグラウンドで起動：

```bash
docker compose up -d
```

### フォアグラウンドでの起動

ログをリアルタイムで確認したい場合：

```bash
docker compose up app
```

## アプリケーションの確認

アプリケーションが起動したら、以下のURLでアクセスできます：

- **ローカル**: http://localhost:5173/
- **ネットワーク**: http://172.x.x.x:5173/ （コンテナのIPアドレス）

## ログの確認

バックグラウンドで起動したアプリケーションのログを確認する場合：

```bash
# 全てのサービスのログを表示
docker compose logs

# 特定のサービス（app）のログを表示
docker compose logs app

# リアルタイムでログを追跡
docker compose logs -f app
```

## アプリケーションの停止

### バックグラウンドで動作しているアプリケーションの停止

```bash
docker compose down
```

### 特定のサービスのみを停止

```bash
docker compose stop app
```

### フォアグラウンドで動作している場合

ターミナルで `Ctrl + C` を押してください。

## その他のコマンド

### アプリケーションの再起動

```bash
docker compose restart app
```

### コンテナの状態確認

```bash
docker compose ps
```

### イメージの再ビルド

ソースコードを変更してDockerfileやpackage.jsonを更新した場合：

```bash
docker compose build app
docker compose up -d app
```

または、ビルドと起動を同時に実行：

```bash
docker compose up -d --build app
```

### 依存関係を追加した場合の完全再ビルド

新しいnpmパッケージを追加した場合やpackage.jsonを変更した場合：

```bash
# キャッシュを無効にして完全再ビルド
docker compose build --no-cache app
docker compose up -d app
```

または、コンテナとボリュームを削除してから再ビルド：

```bash
docker compose down -v
docker compose up -d --build app
```

### コンテナとボリュームの完全削除

全てのコンテナ、ネットワーク、ボリュームを削除：

```bash
docker compose down -v
```

## 開発時のワークフロー

1. **初回起動**:
   ```bash
   docker compose up -d --build app
   ```

2. **日常的な起動**:
   ```bash
   docker compose up -d app
   ```

3. **ログ確認**:
   ```bash
   docker compose logs -f app
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
  app:
    ports:
      - "3000:5173"  # ホストの3000番ポートにマッピング
```

### コンテナが起動しない場合

1. ログを確認：
   ```bash
   docker compose logs app
   ```

2. コンテナを再ビルド：
   ```bash
   docker compose build --no-cache app
   ```

3. 完全にクリーンアップしてから再起動：
   ```bash
   docker compose down -v
   docker compose up -d --build app
   ```

## テストの実行

### 単体テスト（Unit Tests）

Vitestを使用した単体テストをDockerコンテナ内で実行：

```bash
# 単体テストを一度だけ実行
docker compose --profile test run --rm test

# または、直接コマンドを指定して実行
docker compose run --rm app npm run test:run
```

### E2Eテスト（End-to-End Tests）

Playwrightを使用したE2EテストをDockerコンテナ内で実行：

```bash
# アプリケーションが起動していることを確認してからE2Eテストを実行
docker compose up -d app
docker compose --profile e2e run --rm e2e

# または、直接コマンドを指定して実行
docker compose run --rm app npm run test:e2e
```

### テスト用のワークフロー

1. **開発中の継続的テスト**:
   ```bash
   # アプリケーション起動
   docker compose up -d app
   
   # 単体テストを監視モードで実行
   docker compose run --rm app npm run test
   ```

2. **CI/CD用の一括テスト**:
   ```bash
   # 全てのテストを順次実行
   docker compose build --no-cache
   docker compose --profile test run --rm test
   docker compose up -d app
   docker compose --profile e2e run --rm e2e
   docker compose down
   ```

### テストのトラブルシューティング

#### E2Eテストが失敗する場合

1. アプリケーションが完全に起動していることを確認：
   ```bash
   docker compose logs app
   curl http://localhost:5173
   ```

2. ブラウザのUIを確認したい場合：
   ```bash
   docker compose run --rm app npm run test:e2e:ui
   ```

#### 単体テストでモジュールが見つからない場合

依存関係を再インストール：
```bash
docker compose build --no-cache app
docker compose --profile test run --rm test
```

## 便利なエイリアス

以下のエイリアスを `.bashrc` や `.zshrc` に追加すると便利です：

```bash
alias dc="docker compose"
alias dcup="docker compose up -d"
alias dcdown="docker compose down"
alias dclogs="docker compose logs -f"
alias dcps="docker compose ps"
alias dctest="docker compose --profile test run --rm test"
alias dce2e="docker compose --profile e2e run --rm e2e"
```
