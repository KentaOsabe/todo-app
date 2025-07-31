import { test, expect } from '@playwright/test';

test.describe('Todo App E2E Tests', () => {
  // 概要: ページが正しく読み込まれ、基本的なUI要素が表示されることを確認
  // 目的: アプリケーションの基本構造がブラウザで正しく動作することを保証
  test('should load the todo app with basic elements', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /todo app/i })).toBeVisible();
    await expect(page.getByPlaceholder(/add new todo/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /add/i })).toBeVisible();
  });

  // 概要: ユーザーが新しいTodoを追加できることをE2Eで確認
  // 目的: Todo追加機能がブラウザ環境で正しく動作することを保証
  test('should add a new todo', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder(/add new todo/i);
    const addButton = page.getByRole('button', { name: /add/i });

    await input.fill('Learn Playwright');
    await addButton.click();

    await expect(page.getByText('Learn Playwright')).toBeVisible();
    await expect(input).toHaveValue('');
  });

  // 概要: ユーザーがTodoの完了状態を切り替えられることをE2Eで確認
  // 目的: Todo完了機能がブラウザ環境で正しく動作することを保証
  test('should toggle todo completion', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder(/add new todo/i);
    const addButton = page.getByRole('button', { name: /add/i });

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

    const input = page.getByPlaceholder(/add new todo/i);
    const addButton = page.getByRole('button', { name: /add/i });

    await input.fill('Todo to delete');
    await addButton.click();

    await expect(page.getByText('Todo to delete')).toBeVisible();

    const deleteButton = page.getByRole('button', { name: /delete/i });
    await deleteButton.click();

    await expect(page.getByText('Todo to delete')).not.toBeVisible();
  });

  // 概要: 複数のTodoを管理できることをE2Eで確認
  // 目的: アプリケーションが複数のTodoを正しく表示・管理できることを保証
  test('should handle multiple todos', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder(/add new todo/i);
    const addButton = page.getByRole('button', { name: /add/i });

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

    const addButton = page.getByRole('button', { name: /add/i });

    // 空の状態でAddボタンをクリック
    await addButton.click();

    // チェックボックスが表示されないことを確認（Todoが追加されていない）
    await expect(page.getByRole('checkbox')).toHaveCount(0);
  });
});