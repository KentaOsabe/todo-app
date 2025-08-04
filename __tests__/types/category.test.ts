import { describe, it, expect } from 'vitest';
import type { Category } from '../../src/types/category';

describe('Category型', () => {
  // 概要: Category型のオブジェクト作成のテスト
  // 目的: Categoryインターフェースに準拠したオブジェクトが作成できることを確認
  it('正しいCategory型のオブジェクトを作成できる', () => {
    const category: Category = {
      id: 'cat-1',
      name: '仕事',
      color: '#1976d2'
    };

    expect(category.id).toBe('cat-1');
    expect(category.name).toBe('仕事');
    expect(category.color).toBe('#1976d2');
  });

  // 概要: Category型の必須プロパティのテスト
  // 目的: Category型に必要なすべてのプロパティが含まれていることを確認
  it('必要なプロパティがすべて含まれている', () => {
    const category: Category = {
      id: 'cat-2',
      name: 'プライベート',
      color: '#ff5722'
    };

    expect(category).toHaveProperty('id');
    expect(category).toHaveProperty('name');
    expect(category).toHaveProperty('color');
  });

  // 概要: idプロパティの型チェック
  // 目的: idフィールドが文字列型であることを確認
  it('idが文字列型である', () => {
    const category: Category = {
      id: 'test-id',
      name: 'テスト',
      color: '#00ff00'
    };

    expect(typeof category.id).toBe('string');
  });

  // 概要: nameプロパティの型チェック
  // 目的: nameフィールドが文字列型であることを確認
  it('nameが文字列型である', () => {
    const category: Category = {
      id: 'test-id',
      name: 'テストカテゴリ',
      color: '#ff0000'
    };

    expect(typeof category.name).toBe('string');
  });

  // 概要: colorプロパティの型チェック
  // 目的: colorフィールドが文字列型であることを確認
  it('colorが文字列型である', () => {
    const category: Category = {
      id: 'test-id',
      name: 'テスト',
      color: '#0000ff'
    };

    expect(typeof category.color).toBe('string');
  });
});