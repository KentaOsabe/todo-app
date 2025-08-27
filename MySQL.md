# MySQL Docker環境 接続・テスト手順書

このドキュメントでは、Docker Compose で構築したMySQL 8.0.43環境への接続方法とテスト手順について説明します。

## 環境情報

- **MySQL バージョン**: 8.0.43
- **コンテナ名**: todo-mysql
- **ポート**: 3306
- **データベース名**: todo_development
- **ユーザー名**: todo_user
- **パスワード**: todo_password
- **ルートパスワード**: root_password
- **文字セット**: utf8mb4
- **コレーション**: utf8mb4_unicode_ci
- **タイムゾーン**: Asia/Tokyo

## MySQL環境の起動

### 1. MySQL単体での起動

```bash
docker compose up -d mysql
```

### 2. アプリケーションと同時起動

```bash
docker compose up -d
```

### 3. 起動状況の確認

```bash
# コンテナの状態確認
docker compose ps

# MySQLログの確認
docker compose logs mysql

# リアルタイムでログを追跡
docker compose logs -f mysql
```

## MySQL接続方法

### 1. Docker Composeを使用した接続（推奨）

```bash
# MySQL CLIでの接続
docker compose exec mysql mysql -u todo_user -p todo_development

# ルートユーザーでの接続
docker compose exec mysql mysql -u root -p

# シェルアクセス
docker compose exec mysql bash
```

### 2. ローカルのMySQLクライアントからの接続

```bash
# MySQL CLI（ローカルにMySQLクライアントがインストール済みの場合）
mysql -h 127.0.0.1 -P 3306 -u todo_user -p todo_development

# HeidiSQL、phpMyAdmin、MySQL Workbench等のGUIツール
# ホスト: 127.0.0.1
# ポート: 3306
# ユーザー: todo_user
# パスワード: todo_password
# データベース: todo_development
```

### 3. 接続テスト用クエリ

```sql
-- 接続確認
SELECT 'MySQL connection successful' AS status;

-- データベース設定確認
SELECT @@character_set_database, @@collation_database;
SELECT @@global.time_zone, @@session.time_zone;

-- テストテーブル確認
SELECT * FROM connection_test;

-- 現在の日時確認（タイムゾーン設定確認）
SELECT NOW() AS current_time, @@session.time_zone AS timezone;
```

## データ永続化テスト

### 1. データの挿入テスト

```sql
-- テストデータの挿入
INSERT INTO connection_test (message) VALUES ('Data persistence test');

-- データの確認
SELECT * FROM connection_test ORDER BY created_at DESC;
```

### 2. コンテナ再起動テスト

```bash
# コンテナを停止
docker compose down

# コンテナを再起動
docker compose up -d mysql

# データが保持されているか確認
docker compose exec mysql mysql -u todo_user -p todo_development -e "SELECT * FROM connection_test;"
```

### 3. ボリュームの確認

```bash
# Dockerボリュームの確認
docker volume ls

# MySQLデータボリュームの詳細確認
docker volume inspect todo-app_mysql_data
```

## トラブルシューティング

### MySQL起動失敗の場合

1. **ポートコンフリクトの確認**:
   ```bash
   # 3306番ポートの使用状況確認
   lsof -i :3306
   netstat -an | grep 3306
   ```

2. **コンテナログの確認**:
   ```bash
   docker compose logs mysql
   ```

3. **完全再構築**:
   ```bash
   # コンテナとボリュームを削除
   docker compose down -v
   
   # 完全再構築
   docker compose up -d mysql
   ```

### 接続エラーの場合

1. **コンテナの状態確認**:
   ```bash
   docker compose ps
   docker compose logs mysql
   ```

2. **ネットワーク接続確認**:
   ```bash
   # コンテナ内からの疎通確認
   docker compose exec mysql ping mysql
   
   # ローカルからの疎通確認
   telnet 127.0.0.1 3306
   ```

3. **認証情報の確認**:
   ```sql
   -- ルートユーザーで接続してユーザー確認
   SELECT User, Host FROM mysql.user WHERE User = 'todo_user';
   ```

### パフォーマンステスト

```sql
-- 基本的なパフォーマンステスト
SHOW VARIABLES LIKE 'innodb%';
SHOW STATUS LIKE 'Innodb%';

-- プロセス一覧確認
SHOW PROCESSLIST;

-- データベースサイズ確認
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'todo_development'
GROUP BY table_schema;
```

## 推奨ワークフロー

### 1. 開発開始時

```bash
# MySQL環境の起動
docker compose up -d mysql

# 接続テスト
docker compose exec mysql mysql -u todo_user -p todo_development -e "SELECT 'OK' AS connection_test;"
```

### 2. 開発中

```bash
# ログ監視（問題発生時）
docker compose logs -f mysql

# データベースへの接続
docker compose exec mysql mysql -u todo_user -p todo_development
```

### 3. 開発終了時

```bash
# 全体停止（データは保持される）
docker compose down

# または、MySQL のみ停止
docker compose stop mysql
```

### 4. 環境リセット時

```bash
# データベースを完全リセット（データ削除）
docker compose down -v
docker volume rm todo-app_mysql_data
docker compose up -d mysql
```

## セキュリティに関する注意

- **本番環境での使用禁止**: 現在の設定はローカル開発環境専用です
- **パスワードの変更**: 本番環境では必ず強固なパスワードを設定してください
- **ポート公開**: 本番環境では3306ポートの外部公開を避けてください
- **SSL/TLS**: 本番環境ではSSL/TLS接続を有効にしてください

## Rails APIサーバーからの接続準備

Rails アプリケーションからの接続に必要な設定情報:

```yaml
# config/database.yml (example)
development:
  adapter: mysql2
  encoding: utf8mb4
  database: todo_development
  username: todo_user
  password: todo_password
  host: mysql  # Docker Compose内での接続
  # host: 127.0.0.1  # ローカル開発時
  port: 3306
  charset: utf8mb4
  collation: utf8mb4_unicode_ci
```

**注意**: Docker Compose内のサービス間通信では `host: mysql` を使用し、ローカルマシンからの接続では `host: 127.0.0.1` を使用してください。