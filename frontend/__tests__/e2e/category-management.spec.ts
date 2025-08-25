import { expect, test } from '@playwright/test'

test.describe('Category Management E2E Tests', () => {
  // 概要: ナビゲーション機能をテスト
  // 目的: Todo画面とカテゴリ管理画面間の遷移が正しく動作することを保証（Issue #5要件）
  test('should navigate between Todo and Category pages', async ({ page }) => {
    await page.goto('/')

    // Todo画面の表示確認
    await expect(page.getByRole('heading', { name: /todo app/i })).toBeVisible()

    // ナビゲーションタブの存在確認
    await expect(page.getByRole('tab', { name: 'Todo page' })).toBeVisible()
    await expect(
      page.getByRole('tab', { name: 'Categories management page' })
    ).toBeVisible()

    // カテゴリ管理タブをクリック
    await page.getByRole('tab', { name: 'Categories management page' }).click()

    // URLが正しく変更されることを確認
    await expect(page).toHaveURL('/categories')

    // カテゴリ管理画面の表示確認
    await expect(
      page.getByRole('heading', { name: 'カテゴリ管理' })
    ).toBeVisible()

    // Todoタブをクリック
    await page.getByRole('tab', { name: 'Todo page' }).click()

    // URLが正しく変更されることを確認
    await expect(page).toHaveURL('/')

    // Todo画面に戻ることを確認
    await expect(page.getByRole('heading', { name: /todo app/i })).toBeVisible()
  })

  // 概要: カテゴリ一覧画面の基本機能をテスト
  // 目的: カテゴリ一覧ページが正しく表示され、新規作成ボタンが動作することを保証（Issue #5要件）
  test('should display categories list with new button', async ({ page }) => {
    await page.goto('/categories')

    // ページタイトルの確認
    await expect(
      page.getByRole('heading', { name: 'カテゴリ管理' })
    ).toBeVisible()

    // 新規作成ボタンの確認
    await expect(page.getByRole('button', { name: '新規作成' })).toBeVisible()

    // デフォルトカテゴリの表示確認
    await expect(page.getByText('仕事').first()).toBeVisible()
    await expect(page.getByText('プライベート').first()).toBeVisible()
    await expect(page.getByText('その他').first()).toBeVisible()

    // 各カテゴリの編集・削除ボタンの確認
    const editButtons = page.getByRole('button', { name: '編集' })
    const deleteButtons = page.getByRole('button', { name: '削除' })

    await expect(editButtons).toHaveCount(3)
    await expect(deleteButtons).toHaveCount(3)
  })

  // 概要: 新規カテゴリ作成フォームへの遷移をテスト
  // 目的: 新規作成ボタンから作成フォームに正しく遷移できることを保証（Issue #5要件）
  test('should navigate to new category form', async ({ page }) => {
    await page.goto('/categories')

    // 新規作成ボタンをクリック
    await page.getByRole('button', { name: '新規作成' }).click()

    // URLが正しく変更されることを確認
    await expect(page).toHaveURL('/categories/new')

    // フォームの表示確認
    await expect(page.getByText('カテゴリ新規作成')).toBeVisible()
    await expect(page.getByLabel('カテゴリ名')).toBeVisible()
    await expect(page.getByLabel('色')).toBeVisible()
    await expect(page.getByLabel('説明')).toBeVisible()
    await expect(page.getByRole('button', { name: '作成' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible()
  })

  // 概要: 新規カテゴリ作成機能をテスト
  // 目的: カテゴリ作成フォームで新しいカテゴリを作成できることを保証（Issue #5要件）
  test('should create new category', async ({ page }) => {
    await page.goto('/categories/new')

    // フォームに入力
    await page.getByLabel('カテゴリ名').fill('学習')
    await page.getByLabel('色').fill('#4caf50')
    await page.getByLabel('説明').fill('学習関連のタスク')

    // 作成ボタンをクリック
    await page.getByRole('button', { name: '作成' }).click()

    // カテゴリ一覧に戻ることを確認
    await expect(page).toHaveURL('/categories')

    // 新しいカテゴリが表示されることを確認
    await expect(page.getByText('学習').first()).toBeVisible()
  })

  // Note: 詳細なバリデーションエラーメッセージのテストは単体テストで実施済み
  // E2Eではバリデーションエラー時の画面遷移制御のみをテスト
  test('should prevent navigation when validation fails', async ({ page }) => {
    await page.goto('/categories/new')

    // 空の状態で作成ボタンをクリック
    await page.getByRole('button', { name: '作成' }).click()

    // URLが変わらないことを確認（バリデーションエラーで作成に失敗）
    await expect(page).toHaveURL('/categories/new')
  })

  // 概要: カテゴリ作成のキャンセル機能をテスト
  // 目的: キャンセルボタンでカテゴリ一覧に戻れることを保証（Issue #5要件）
  test('should cancel category creation', async ({ page }) => {
    await page.goto('/categories/new')

    // フォームに入力
    await page.getByLabel('カテゴリ名').fill('テストカテゴリ')

    // キャンセルボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click()

    // カテゴリ一覧に戻ることを確認
    await expect(page).toHaveURL('/categories')

    // 入力したカテゴリが作成されていないことを確認
    await expect(page.getByText('テストカテゴリ')).not.toBeVisible()
  })

  // 概要: カテゴリ編集フォームへの遷移をテスト
  // 目的: 編集ボタンから編集フォームに正しく遷移できることを保証（Issue #5要件）
  test('should navigate to edit category form', async ({ page }) => {
    await page.goto('/categories')

    // 最初のカテゴリの編集ボタンをクリック
    const editButtons = page.getByRole('button', { name: '編集' })
    await editButtons.first().click()

    // URLが正しく変更されることを確認（work カテゴリの編集）
    await expect(page).toHaveURL('/categories/work/edit')

    // 編集フォームの表示確認
    await expect(page.getByText('カテゴリ編集')).toBeVisible()
    await expect(page.getByLabel('カテゴリ名')).toHaveValue('仕事')
    await expect(page.getByRole('button', { name: '更新' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible()
  })

  // 概要: カテゴリ編集機能をテスト
  // 目的: カテゴリ編集フォームで既存カテゴリを更新できることを保証（Issue #5要件）
  test('should edit existing category', async ({ page }) => {
    await page.goto('/categories/work/edit')

    // フォーム内容の確認
    await expect(page.getByLabel('カテゴリ名')).toHaveValue('仕事')

    // フォームを更新
    await page.getByLabel('カテゴリ名').fill('ビジネス')
    await page.getByLabel('説明').fill('ビジネス関連のタスク')

    // 更新ボタンをクリック
    await page.getByRole('button', { name: '更新' }).click()

    // カテゴリ一覧に戻ることを確認
    await expect(page).toHaveURL('/categories')

    // 更新されたカテゴリが表示されることを確認
    await expect(page.getByText('ビジネス').first()).toBeVisible()
  })

  // 概要: カテゴリ編集のキャンセル機能をテスト
  // 目的: 編集キャンセルボタンでカテゴリ一覧に戻れることを保証（Issue #5要件）
  test('should cancel category editing', async ({ page }) => {
    await page.goto('/categories/private/edit')

    // フォーム内容を変更
    await page.getByLabel('カテゴリ名').fill('変更されたプライベート')

    // キャンセルボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click()

    // カテゴリ一覧に戻ることを確認
    await expect(page).toHaveURL('/categories')

    // 元のカテゴリ名が保持されていることを確認
    await expect(page.getByText('プライベート')).toBeVisible()
    await expect(page.getByText('変更されたプライベート')).not.toBeVisible()
  })

  // 概要: カテゴリ削除機能をテスト
  // 目的: 削除ボタンで確認ダイアログが表示され、削除が実行されることを保証（Issue #5要件）
  test('should delete category with confirmation', async ({ page }) => {
    await page.goto('/categories')

    // 「その他」カテゴリを削除（使用されていないため削除可能）
    const deleteButtons = page.getByRole('button', { name: '削除' })

    // 削除前にカテゴリが存在することを確認
    await expect(page.getByText('その他').first()).toBeVisible()

    // ダイアログハンドラーを設定
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('このカテゴリを削除しますか？')
      await dialog.accept()
    })

    // 最後の削除ボタン（その他カテゴリ）をクリック
    await deleteButtons.last().click()

    // カテゴリが削除されることを確認
    await expect(page.getByText('その他').first()).not.toBeVisible()
  })

  // 概要: 存在しないカテゴリIDでのアクセスをテスト
  // 目的: 無効なカテゴリIDで編集ページにアクセスした場合の動作を保証（Issue #5要件）
  test('should handle invalid category ID in edit route', async ({ page }) => {
    await page.goto('/categories/invalid-id/edit')

    // エラーメッセージが表示されることを確認
    await expect(page.getByText('カテゴリが見つかりません')).toBeVisible()

    // URLは変わらない（エラーページが表示される）
    await expect(page).toHaveURL('/categories/invalid-id/edit')
  })

  // 概要: 404ページの表示をテスト
  // 目的: 存在しないパスにアクセスした場合に404ページが表示されることを保証（Issue #5要件）
  test('should display 404 page for invalid routes', async ({ page }) => {
    await page.goto('/invalid-path')

    // 404ページの表示確認
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText('ページが見つかりません')).toBeVisible()

    // ナビゲーションボタンの確認
    await expect(
      page.getByRole('button', { name: 'ホームに戻る' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'カテゴリ管理に戻る' })
    ).toBeVisible()
  })

  // 概要: 404ページからのナビゲーションをテスト
  // 目的: 404ページのナビゲーションボタンが正しく動作することを保証（Issue #5要件）
  test('should navigate from 404 page', async ({ page }) => {
    await page.goto('/invalid-path')

    // ホームに戻るボタンをクリック
    await page.getByRole('button', { name: 'ホームに戻る' }).click()

    // ホームページに遷移することを確認
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: /todo app/i })).toBeVisible()

    // 再度404ページに移動
    await page.goto('/another-invalid-path')

    // カテゴリ管理に戻るボタンをクリック
    await page.getByRole('button', { name: 'カテゴリ管理に戻る' }).click()

    // カテゴリ管理ページに遷移することを確認
    await expect(page).toHaveURL('/categories')
    await expect(
      page.getByRole('heading', { name: 'カテゴリ管理' })
    ).toBeVisible()
  })

  // 概要: カテゴリ管理とTodo機能の統合をテスト
  // 目的: 新しく作成したカテゴリがTodo作成フォームで利用できることを保証（Issue #5要件）
  test('should integrate new category with todo creation', async ({ page }) => {
    // 新しいカテゴリを作成
    await page.goto('/categories/new')

    await page.getByLabel('カテゴリ名').fill('テスト統合')
    await page.getByLabel('色').fill('#9c27b0')
    await page.getByLabel('説明').fill('統合テスト用')
    await page.getByRole('button', { name: '作成' }).click()

    // Todo画面に移動
    await page.getByRole('tab', { name: 'Todo page' }).click()
    await expect(page).toHaveURL('/')

    // カテゴリセレクトで新しいカテゴリが選択できることを確認
    const categorySelect = page.getByLabel('カテゴリ').first()
    await categorySelect.click()

    // 新しく作成したカテゴリが選択肢に含まれることを確認
    await expect(page.getByText('テスト統合')).toBeVisible()

    // 新しいカテゴリを選択してTodoを作成
    await page.getByText('テスト統合').click()

    const todoInput = page.getByPlaceholder('新しいタスクを入力')
    await todoInput.fill('統合テスト用Todo')

    await page.getByRole('button', { name: '追加' }).click()

    // Todoが作成されることを確認
    await expect(page.getByText('統合テスト用Todo')).toBeVisible()
  })
})
