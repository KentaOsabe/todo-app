require "test_helper"

class CategoriesControllerUsageTest < ActionDispatch::IntegrationTest
  setup do
    @used_category = categories(:one)
    @unused_category = categories(:unused)
  end

  # 概要: 使用中カテゴリの使用状況API応答をテスト
  # 目的: Todoが紐づくカテゴリで in_use=true と counts.todos が正の値になることを保証
  test "GET /api/categories/:id/usage returns in_use true when todos exist" do
    get "/api/categories/#{@used_category.id}/usage"
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal true, json.dig("data", "in_use")
    assert json.dig("data", "counts", "todos") > 0
  end

  # 概要: 未使用カテゴリの使用状況API応答をテスト
  # 目的: Todoが存在しないカテゴリで in_use=false と counts.todos=0 となることを保証
  test "GET /api/categories/:id/usage returns false when no todos" do
    get "/api/categories/#{@unused_category.id}/usage"
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal false, json.dig("data", "in_use")
    assert_equal 0, json.dig("data", "counts", "todos")
  end

  # 概要: 存在しないカテゴリID指定時のエラーハンドリングをテスト
  # 目的: 未存在IDで404と既存エラーフォーマットを返すことを保証
  test "GET /api/categories/:id/usage returns 404 when not found" do
    get "/api/categories/999999/usage"
    assert_response :not_found

    json = JSON.parse(response.body)
    assert_equal "NOT_FOUND", json.dig("errors", 0, "code")
  end

  # 概要: DB接続エラー強制時のレスポンスをテスト
  # 目的: DB例外が発生した場合に500と統一エラーフォーマットを返すことを保証
  test "GET /api/categories/:id/usage returns 500 on DB error" do
    get "/api/categories/#{@used_category.id}/usage", headers: { 'X-Force-Db-Error' => '1' }
    assert_response :internal_server_error

    json = JSON.parse(response.body)
    assert_equal "INTERNAL_SERVER_ERROR", json.dig("errors", 0, "code")
  end
end
