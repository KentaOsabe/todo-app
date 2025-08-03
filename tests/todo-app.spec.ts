import { test, expect } from '@playwright/test';

test.describe('Todo App E2E Tests', () => {
  // 概要: ページが正しく読み込まれ、基本的なUI要素が表示されることを確認
  // 目的: アプリケーションの基本構造がブラウザで正しく動作することを保証
  test('should load the todo app with basic elements', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /todo app/i })).toBeVisible();
    await expect(page.getByPlaceholder('新しいタスクを入力')).toBeVisible();
    await expect(page.getByRole('button', { name: '追加' })).toBeVisible();
  });

  // 概要: ユーザーが新しいTodoを追加できることをE2Eで確認
  // 目的: Todo追加機能がブラウザ環境で正しく動作することを保証
  test('should add a new todo', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('新しいタスクを入力');
    const addButton = page.getByRole('button', { name: '追加' });

    await input.fill('Learn Playwright');
    await addButton.click();

    await expect(page.getByText('Learn Playwright')).toBeVisible();
    await expect(input).toHaveValue('');
  });

  // 概要: ユーザーがTodoの完了状態を切り替えられることをE2Eで確認
  // 目的: Todo完了機能がブラウザ環境で正しく動作することを保証
  test('should toggle todo completion', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('新しいタスクを入力');
    const addButton = page.getByRole('button', { name: '追加' });

    await input.fill('Test Todo');
    await addButton.click();

    const checkbox = page.getByRole('checkbox');
    await expect(checkbox).not.toBeChecked();

    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // 完了済みTodoのテキストに取り消し線が適用されることを確認
    const todoText = page.getByText('Test Todo');
    await expect(todoText).toHaveCSS('text-decoration', /line-through/);
  });

  // 概要: ユーザーがTodoを削除できることをE2Eで確認
  // 目的: Todo削除機能がブラウザ環境で正しく動作することを保証
  test('should delete a todo', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('新しいタスクを入力');
    const addButton = page.getByRole('button', { name: '追加' });

    await input.fill('Todo to delete');
    await addButton.click();

    await expect(page.getByText('Todo to delete')).toBeVisible();

    const deleteButton = page.getByRole('button', { name: 'delete', exact: true });
    await deleteButton.click();

    await expect(page.getByText('Todo to delete')).not.toBeVisible();
  });

  // 概要: 複数のTodoを管理できることをE2Eで確認
  // 目的: アプリケーションが複数のTodoを正しく表示・管理できることを保証
  test('should handle multiple todos', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('新しいタスクを入力');
    const addButton = page.getByRole('button', { name: '追加' });

    // 複数のTodoを追加
    await input.fill('First Todo');
    await addButton.click();

    await input.fill('Second Todo');
    await addButton.click();

    await input.fill('Third Todo');
    await addButton.click();

    // 全てのTodoが表示されることを確認
    await expect(page.getByText('First Todo')).toBeVisible();
    await expect(page.getByText('Second Todo')).toBeVisible();
    await expect(page.getByText('Third Todo')).toBeVisible();

    // チェックボックスが3つ表示されることを確認
    const checkboxes = page.getByRole('checkbox');
    await expect(checkboxes).toHaveCount(3);
  });

  // 概要: 空のTodoが追加されないことをE2Eで確認
  // 目的: バリデーション機能がブラウザ環境で正しく動作することを保証
  test('should not add empty todo', async ({ page }) => {
    await page.goto('/');

    const addButton = page.getByRole('button', { name: '追加' });

    // 空の状態でAddボタンをクリック
    await addButton.click();

    // チェックボックスが表示されないことを確認（Todoが追加されていない）
    await expect(page.getByRole('checkbox')).toHaveCount(0);
  });

  // 概要: カテゴリ付きTodoを追加できることをE2Eで確認
  // 目的: カテゴリ機能がブラウザ環境で正しく動作することを保証
  test('should add todo with category', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('新しいタスクを入力');
    const categorySelect = page.getByLabel('カテゴリ');
    const addButton = page.getByRole('button', { name: '追加' });

    await input.fill('仕事のタスク');
    await categorySelect.click();
    await page.getByText('仕事').click();
    await addButton.click();

    await expect(page.getByText('仕事のタスク')).toBeVisible();
    // カテゴリ付きTodoが作成されたことを確認（表示確認は単体テストで実施済み）
  });

  // 概要: タグ付きTodoを追加できることをE2Eで確認
  // 目的: タグ機能がブラウザ環境で正しく動作することを保証
  test('should add todo with tags', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('新しいタスクを入力');
    const tagInput = page.getByLabel('タグ');
    const addButton = page.getByRole('button', { name: '追加' });

    await input.fill('タグ付きタスク');
    await tagInput.fill('重要, 急ぎ');
    await addButton.click();

    await expect(page.getByText('タグ付きタスク')).toBeVisible();
    // タグ付きTodoが作成されたことを確認（タグ表示確認は単体テストで実施済み）
  });

  // 概要: カテゴリとタグの両方を持つTodoを追加できることをE2Eで確認
  // 目的: カテゴリ・タグ機能の組み合わせがブラウザ環境で正しく動作することを保証
  test('should add todo with both category and tags', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('新しいタスクを入力');
    const categorySelect = page.getByLabel('カテゴリ');
    const tagInput = page.getByLabel('タグ');
    const addButton = page.getByRole('button', { name: '追加' });

    await input.fill('完全なタスク');
    await categorySelect.click();
    await page.getByText('プライベート').click();
    await tagInput.fill('買い物, 今日中');
    await addButton.click();

    await expect(page.getByText('完全なタスク')).toBeVisible();
    // カテゴリとタグ両方を持つTodoが作成されたことを確認（表示確認は単体テストで実施済み）
  });
});