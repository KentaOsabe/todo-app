require "test_helper"

class CategoryTest < ActiveSupport::TestCase
  def setup
    @category = Category.new(name: "テストカテゴリ")
  end

  # 概要: 有効な属性でCategoryモデルのバリデーションが通ることをテスト
  # 目的: 基本的なCategory作成が正常に動作することを保証
  test "should be valid with valid attributes" do
    assert @category.valid?
  end

  # 概要: nameが空の場合にバリデーションエラーになることをテスト
  # 目的: name属性の必須バリデーションが正しく機能することを保証
  test "should require name" do
    @category.name = nil
    assert_not @category.valid?
    assert_includes @category.errors[:name], "can't be blank"
  end

  # 概要: 重複するnameでの作成が失敗することをテスト
  # 目的: name属性の一意制約が正しく機能することを保証
  test "should enforce name uniqueness" do
    @category.save!
    duplicate_category = Category.new(name: "テストカテゴリ")
    assert_not duplicate_category.valid?
    assert_includes duplicate_category.errors[:name], "has already been taken"
  end

  # 概要: nameの長さ制限（255文字）が機能することをテスト
  # 目的: name属性の長さバリデーションが正しく機能することを保証
  test "should enforce name length limit" do
    @category.name = "a" * 256  # 255文字を超える
    assert_not @category.valid?
    assert_includes @category.errors[:name], "is too long (maximum is 255 characters)"
  end

  # 概要: Categoryが複数のTodoを持てることをテスト
  # 目的: has_manyアソシエーションが正しく機能することを保証
  test "should have many todos" do
    @category.save!
    todo1 = @category.todos.create!(text: "テスト Todo 1", completed: false)
    todo2 = @category.todos.create!(text: "テスト Todo 2", completed: true)
    
    assert_equal 2, @category.todos.count
    assert_includes @category.todos, todo1
    assert_includes @category.todos, todo2
  end

  # 概要: Category削除時に関連するTodoも削除されることをテスト
  # 目的: dependent: :destroyオプションが正しく機能することを保証
  test "should destroy associated todos when category is destroyed" do
    @category.save!
    todo1 = @category.todos.create!(text: "テスト Todo 1", completed: false)
    todo2 = @category.todos.create!(text: "テスト Todo 2", completed: true)
    
    assert_difference 'Todo.count', -2 do
      @category.destroy
    end
  end
end
