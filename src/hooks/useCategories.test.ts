import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCategories } from './useCategories';

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useCategories', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('初期状態でデフォルトカテゴリが存在する', () => {
    const { result } = renderHook(() => useCategories());

    expect(result.current.categories).toHaveLength(3);
    expect(result.current.categories[0].name).toBe('仕事');
    expect(result.current.categories[1].name).toBe('プライベート');
    expect(result.current.categories[2].name).toBe('その他');
  });

  it('カテゴリを追加できる', () => {
    const { result } = renderHook(() => useCategories());

    act(() => {
      result.current.addCategory('学習', '#4caf50');
    });

    expect(result.current.categories).toHaveLength(4);
    expect(result.current.categories[3].name).toBe('学習');
    expect(result.current.categories[3].color).toBe('#4caf50');
  });

  it('同じ名前のカテゴリは追加できない', () => {
    const { result } = renderHook(() => useCategories());

    act(() => {
      result.current.addCategory('仕事', '#ff5722');
    });

    // 仕事カテゴリは既に存在するため、追加されない
    expect(result.current.categories).toHaveLength(3);
  });

  it('カテゴリを更新できる', () => {
    const { result } = renderHook(() => useCategories());

    const categoryToUpdate = result.current.categories[0];

    act(() => {
      result.current.updateCategory(categoryToUpdate.id, '重要な仕事', '#f44336');
    });

    const updatedCategory = result.current.categories.find(c => c.id === categoryToUpdate.id);
    expect(updatedCategory?.name).toBe('重要な仕事');
    expect(updatedCategory?.color).toBe('#f44336');
  });

  it('存在しないカテゴリの更新は無視される', () => {
    const { result } = renderHook(() => useCategories());
    const originalCategories = [...result.current.categories];

    act(() => {
      result.current.updateCategory('non-existent-id', '存在しない', '#000000');
    });

    expect(result.current.categories).toEqual(originalCategories);
  });

  it('カテゴリを削除できる', () => {
    const { result } = renderHook(() => useCategories());

    const categoryToDelete = result.current.categories[0];

    act(() => {
      result.current.deleteCategory(categoryToDelete.id);
    });

    expect(result.current.categories).toHaveLength(2);
    expect(result.current.categories.find(c => c.id === categoryToDelete.id)).toBeUndefined();
  });

  it('存在しないカテゴリの削除は無視される', () => {
    const { result } = renderHook(() => useCategories());
    const originalLength = result.current.categories.length;

    act(() => {
      result.current.deleteCategory('non-existent-id');
    });

    expect(result.current.categories).toHaveLength(originalLength);
  });

  it('IDでカテゴリを取得できる', () => {
    const { result } = renderHook(() => useCategories());

    const firstCategory = result.current.categories[0];
    const foundCategory = result.current.getCategoryById(firstCategory.id);

    expect(foundCategory).toEqual(firstCategory);
  });

  it('存在しないIDの場合はundefinedを返す', () => {
    const { result } = renderHook(() => useCategories());

    const foundCategory = result.current.getCategoryById('non-existent-id');

    expect(foundCategory).toBeUndefined();
  });

  it('カテゴリがlocalStorageに永続化される', () => {
    const { result } = renderHook(() => useCategories());

    act(() => {
      result.current.addCategory('テストカテゴリ', '#123456');
    });

    // 新しいフックインスタンスを作成して、永続化されているかを確認
    const { result: newResult } = renderHook(() => useCategories());

    expect(newResult.current.categories).toHaveLength(4);
    expect(newResult.current.categories[3].name).toBe('テストカテゴリ');
  });

  it('デフォルトカテゴリが正しい色を持つ', () => {
    const { result } = renderHook(() => useCategories());

    const workCategory = result.current.categories.find(c => c.name === '仕事');
    const privateCategory = result.current.categories.find(c => c.name === 'プライベート');
    const otherCategory = result.current.categories.find(c => c.name === 'その他');

    expect(workCategory?.color).toBe('#1976d2');
    expect(privateCategory?.color).toBe('#ff5722');
    expect(otherCategory?.color).toBe('#9e9e9e');
  });
});