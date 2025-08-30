require "test_helper"

class TodoTest < ActiveSupport::TestCase
  def setup
    @category = Category.create!(name: "テストカテゴリ")
    @todo = Todo.new(text: "テスト Todo", completed: false, category: @category)
  end

  # 概要: 有効な属性でTodoモデルのバリデーションが通ることをテスト
  # 目的: 基本的なTodo作成が正常に動作することを保証
  test "should be valid with valid attributes" do
    assert @todo.valid?
  end

  # 概要: textが空の場合にバリデーションエラーになることをテスト
  # 目的: text属性の必須バリデーションが正しく機能することを保証
  test "should require text" do
    @todo.text = nil
    assert_not @todo.valid?
    assert_includes @todo.errors[:text], "can't be blank"
  end

  # 概要: categoryが未設定の場合にバリデーションエラーになることをテスト
  # 目的: category属性の必須バリデーションが正しく機能することを保証
  test "should require category" do
    @todo.category = nil
    assert_not @todo.valid?
    assert_includes @todo.errors[:category], "must exist"
  end

  # 概要: completedがnilの場合にバリデーションエラーになることをテスト
  # 目的: completed属性の包含バリデーションが正しく機能することを保証
  test "should validate completed inclusion" do
    @todo.completed = nil
    assert_not @todo.valid?
    assert_includes @todo.errors[:completed], "is not included in the list"
  end

  # 概要: completedがtrueでも有効であることをテスト
  # 目的: 完了状態のTodoが正常に作成できることを保証
  test "should allow completed to be true" do
    @todo.completed = true
    assert @todo.valid?
  end

  # 概要: completedがfalseでも有効であることをテスト
  # 目的: 未完了状態のTodoが正常に作成できることを保証
  test "should allow completed to be false" do
    @todo.completed = false
    assert @todo.valid?
  end

  # 概要: completedのデフォルト値がfalseになることをテスト
  # 目的: 新規Todo作成時のデフォルト動作が正しく機能することを保証
  test "should default completed to false" do
    new_todo = Todo.new(text: "新しい Todo", category: @category)
    new_todo.save!
    assert_equal false, new_todo.completed
  end

  # 概要: TodoがCategoryに属することをテスト
  # 目的: belongs_toアソシエーションが正しく機能することを保証
  test "should belong to category" do
    @todo.save!
    assert_equal @category, @todo.category
    assert_includes @category.todos, @todo
  end

  # 概要: 長いテキスト内容でも有効であることをテスト
  # 目的: TEXT型フィールドで大容量データが正常に扱えることを保証
  test "should allow long text content" do
    long_text = "あ" * 1000  # 長いテキスト
    @todo.text = long_text
    assert @todo.valid?
  end

  # 概要: 空文字列のtextが無効であることをテスト
  # 目的: 空文字列も必須バリデーションで適切に検出されることを保証
  test "should handle empty string text as invalid" do
    @todo.text = ""
    assert_not @todo.valid?
    assert_includes @todo.errors[:text], "can't be blank"
  end
end
