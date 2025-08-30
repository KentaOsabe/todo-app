require "test_helper"

class CategoriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @category = categories(:one)
    @other = categories(:two)
  end

  # 概要: カテゴリ一覧APIの基本動作をテスト
  # 目的: /api/categories が200を返し、全カテゴリをJSONで返却することを保証
  test "GET /api/categories returns list" do
    get "/api/categories"
    assert_response :success

    json = JSON.parse(response.body)
    assert json["data"].is_a?(Array)
    names = json["data"].map { |c| c["name"] }
    assert_includes names, @category.name
    assert_includes names, @other.name
  end

  # 概要: カテゴリ詳細APIの基本動作をテスト
  # 目的: /api/categories/:id が200を返し、指定カテゴリのJSONを返却することを保証
  test "GET /api/categories/:id returns item" do
    get "/api/categories/#{@category.id}"
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal @category.id, json["data"]["id"]
    assert_equal @category.name, json["data"]["name"]
  end

  # 概要: カテゴリ作成APIの成功ケースをテスト
  # 目的: 有効なnameで201が返り、レコードが作成されることを保証
  test "POST /api/categories creates item" do
    assert_difference("Category.count", 1) do
      post "/api/categories", params: { name: "健康" }, as: :json
    end
    assert_response :created

    json = JSON.parse(response.body)
    assert_equal "健康", json["data"]["name"]
    assert json["data"]["id"].present?
  end

  # 概要: カテゴリ作成APIのバリデーションエラーをテスト
  # 目的: name未指定のとき422とエラー形式のJSONを返すことを保証
  test "POST /api/categories returns 422 on validation error" do
    assert_no_difference("Category.count") do
      post "/api/categories", params: { name: "" }, as: :json
    end
    assert_response :unprocessable_content

    json = JSON.parse(response.body)
    assert json["errors"].is_a?(Array)
    refute_empty json["errors"]
    first = json["errors"].first
    assert_equal "VALIDATION_ERROR", first["code"]
    assert first["message"].is_a?(String)
    assert first.key?("field"), "422エラーにはfieldが含まれるべき"
  end

  # 概要: カテゴリ更新APIの成功ケースをテスト
  # 目的: 有効なnameで200が返り、レコードが更新されることを保証
  test "PUT /api/categories/:id updates item" do
    put "/api/categories/#{@category.id}", params: { name: "学習" }, as: :json
    assert_response :success

    @category.reload
    assert_equal "学習", @category.name
  end

  # 概要: カテゴリ削除APIの成功ケースをテスト
  # 目的: 204 No Contentが返り、レコードが削除されることを保証
  test "DELETE /api/categories/:id deletes item" do
    assert_difference("Category.count", -1) do
      delete "/api/categories/#{@category.id}"
    end
    assert_response :no_content
  end

  # 概要: 存在しないIDアクセス時のエラーハンドリングをテスト
  # 目的: RecordNotFound時に404とエラーJSONが返ることを保証
  test "GET /api/categories/:id returns 404 when not found" do
    get "/api/categories/999999"
    assert_response :not_found

    json = JSON.parse(response.body)
    assert json["errors"].is_a?(Array)
    assert_equal "NOT_FOUND", json["errors"].first["code"]
    assert_equal "Not Found", json["errors"].first["message"]
    refute json["errors"].first.key?("field"), "404エラーにfieldは含めない"
  end

  # 概要: DB接続エラー時の500レスポンスをテスト
  # 目的: DB未接続(ActiveRecord::ConnectionNotEstablished)で500と統一形式のエラーを返すことを保証
  test "GET /api/categories returns 500 on DB connection error" do
    get "/api/categories", headers: { 'X-Force-Db-Error' => '1' }
    assert_response :internal_server_error
    json = JSON.parse(response.body)
    assert json["errors"].is_a?(Array)
    assert_equal "INTERNAL_SERVER_ERROR", json["errors"].first["code"]
    assert_match /Database connection/i, json["errors"].first["message"]
    refute json["errors"].first.key?("field"), "500エラーにfieldは含めない"
  end
end
