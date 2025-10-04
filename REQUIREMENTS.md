# Issue #40 実装計画

## 背景と目的
- 現状は `useCategoryManagement` 内の `isCategoryInUse` がスタブ実装であり、Todo使用状況を正しく判定できない。
- バックエンドにもカテゴリ使用状況を返すAPIが未実装なため、カテゴリ削除制限が正確に働かない。
- Issue #40 の受け入れ基準（使用中カテゴリ削除不可・失敗時のエラー表示と再試行・各種テスト合格）を満たすため、バックエンドとフロントエンド双方の更新が必要。

## 現状確認の要点
- Rails API は `/api/categories` 系のみ提供中で、使用状況のエンドポイントが存在しない。
- コントローラのレスポンス形式は `{ data: ... }` で統一されているため、新APIもこれに合わせる。
- React フロントは `deleteCategory` が同期的に真偽値を返し、`CategoriesPage` で結果に応じてスナックバーを表示している。
- 単体テストは Vitest、E2E は Playwright モックAPI経由で動作。新API追加に伴いモック調整が必要。

## 実装スコープ
- バックエンド: カテゴリ使用状況API追加、関連モデルロジックとテスト。
- フロントエンド: APIクライアント拡張、`useCategoryManagement` の非同期化、UI エラーハンドリング改善、関連テスト更新。
- E2E: Playwright モックとシナリオ追加/更新。

## 詳細計画
### バックエンド
- ルーティング: `GET /api/categories/:id/usage` を追加。`resources :categories do ... end` で member ルートを定義。
- コントローラ: `Api::CategoriesController` に `usage` アクションを追加。
  - 対象カテゴリを取得（既存の `find` 流儀に倣い `Category.find(params[:id])`）。
  - `todos_count = category.todos.count` を求め、`in_use = todos_count.positive?` で判定。
  - レスポンスは `{ data: { in_use: boolean, counts: { todos: number } } }` のJSON。
  - ActiveRecord例外は既存の `rescue_from` に委譲。DBエラーはテストヘッダで誘発可能。
- モデル: 将来の拡張を見据えて、`Category#usage_summary` のようなプレーンメソッドを追加することを検討（ロジック共通化）。単純な処理のためスコープ次第でコントローラ内に収める選択もあるが、テスト容易性を優先してモデルメソッド化予定。

### バックエンドTDD手順
1. `backend/test/controllers/categories_controller_usage_test.rb`（Issue指定名）を新規作成。
   - 使用中カテゴリ（TodoがFIXTUREに存在）で `GET /api/categories/:id/usage` が `in_use: true` と `counts.todos` 正値を返すテストを先に実装。
   - 未使用カテゴリで `in_use: false` / `counts.todos: 0` を検証するテストも追加。
   - 404ケース、DB強制エラー(500)ケースもテスト化。
2. テスト失敗を確認（Red）。
3. ルート追加・コントローラ/モデル実装（必要に応じてモデルメソッド作成）で Green。
4. 重複ロジック整理やJSON生成の共通化などリファクタリング（Refactor）。

### フロントエンド
- APIクライアント: `frontend/src/api/categories.ts` に `getCategoryUsage`（仮）を追加し、新エンドポイントを呼び出す。戻り値型として `CategoryUsage` インターフェースを新設。
- 型更新: `frontend/src/types/category.ts` で `CategoryUsage` と `UseCategoryManagementReturn` を更新。
  - `isCategoryInUse` を `Promise<boolean>` に変更。
  - `deleteCategory` も APIコールを待って真偽値を返す `Promise<boolean>` へ変更し、既存呼び出し側をasync対応。
- フック強化: `useCategoryManagement`
  - `isCategoryInUse` は APIから使用状況を取得。通信エラー時は例外を握り、`setError` に「カテゴリ使用状況の取得に失敗しました」などを設定しつつ `false` を返して再試行可能にする。
  - `deleteCategory` は削除前に `await isCategoryInUse(id)` を呼び、`true` の場合はローカル状態を変えず `false` 返却。
  - APIエラー（使用状況取得・削除API失敗）時はカテゴリ配列の巻き戻しまたは未反映を保証し、メッセージを返す手段を用意。
  - 必要に応じて削除処理のロード状態（例: `deleting` set）を追加しUIで利用できるよう検討。
- UI調整: `CategoriesPage` の `handleDeleteCategory` を `async` 化。
  - 削除操作時に `await deleteCategory(id)` を呼び、結果に応じて成功/使用中エラー/通信エラーを出し分け。
  - API失敗時には「削除に失敗しました。再試行してください。」系のメッセージをスナックバーで表示。
  - 2度目以降の再試行が同じコードで行えるよう追加の状態管理は極力フック内で完結させる。

### フロントエンドTDD手順
1. 既存の `useCategoryManagement` テストを更新: `isCategoryInUse`/`deleteCategory` が Promise を返す前提の新テストを先に追加し、モックAPIが使用状況APIを要求するように変更して失敗を確認。
   - 使用中カテゴリ削除で `await deleteCategory` が `false` を返し、カテゴリが残るテスト。
   - 未使用カテゴリ削除で `true` を返し、配列から除外されるテスト。
   - 使用状況APIエラー時に `error` ステートへメッセージ設定＆false返却を確認するテストを追加。
2. `useCategoryManagement.cancel.test.ts` など関連テストのモックを拡張し、`getCategoryUsage` もダミーを提供するテストを追加（Red）。
3. フロント実装を行い、テスト成功（Green）。
4. コードの共通化やエラーメッセージ定数化などを整える（Refactor）。

### E2Eとモック
- Playwrightモック（`frontend/__tests__/e2e/utils/mockApi.ts`）で `GET /api/categories/:id/usage` に対するハンドラを追加し、`todos` 状態から `counts` を算出。
- E2Eシナリオ拡張: カテゴリページで使用中カテゴリの削除を試みた場合にエラースナックバーが表示されることを確認するテストを追加（要: 画面遷移・confirm モック処理）。
- 既存E2Eが新API追加後も成功することを確認。

## 注意事項・リスク
- フロントAPI非同期化に伴いコンポーネントやテストの更新漏れに注意。
- `confirm` ダイアログのモック戦略（JSDOM/Playwright双方）を事前に整理。
- カテゴリ削除成功後のローカル状態更新と API 失敗時のロールバックを厳密に扱い、二重削除などのレースを避けるため `setCategories` の更新を最新値ベースで記述。
- 新APIレスポンス形式は既存パターンと矛盾がないように設計。

## 想定作業順序
1. バックエンド使用状況APIのテスト追加 → 実装 → リファクタ。
2. フロントフックのテスト更新/追加（使用状況APIモック含む）。
3. フロント実装（APIクライアント→フック→コンポーネント順）とリファクタ。
4. Playwrightモック・E2Eテストの更新と実行結果確認。
5. ドキュメントやコメントの整備、最終チェック。
