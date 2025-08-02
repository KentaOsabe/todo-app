import { describe, it, expect } from 'vitest';
import type { Category } from './category';

describe('Category型', () => {
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

  it('idが文字列型である', () => {
    const category: Category = {
      id: 'test-id',
      name: 'テスト',
      color: '#00ff00'
    };

    expect(typeof category.id).toBe('string');
  });

  it('nameが文字列型である', () => {
    const category: Category = {
      id: 'test-id',
      name: 'テストカテゴリ',
      color: '#ff0000'
    };

    expect(typeof category.name).toBe('string');
  });

  it('colorが文字列型である', () => {
    const category: Category = {
      id: 'test-id',
      name: 'テスト',
      color: '#0000ff'
    };

    expect(typeof category.color).toBe('string');
  });
});