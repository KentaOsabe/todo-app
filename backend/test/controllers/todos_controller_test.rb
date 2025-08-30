require "test_helper"

class TodosControllerTest < ActionDispatch::IntegrationTest
  setup do
    @category = categories(:one)
    @other_category = categories(:two)
    @todo = todos(:one)
    @other_todo = todos(:two)
  end

  # 概要: Todo一覧APIの基本動作をテスト
  # 目的: /api/todos が200を返し、全TodoをJSONで返却することを保証
  test "GET /api/todos returns list" do
    get "/api/todos"
    assert_response :success

    json = JSON.parse(response.body)
    assert json["data"].is_a?(Array)
    texts = json["data"].map { |t| t["text"] }
    assert_includes texts, @todo.text
    assert_includes texts, @other_todo.text
  end

  # 概要: Todo一覧のフィルタリング(完了フラグ)をテスト
  # 目的: completed=true を指定した場合、完了したTodoのみ返すことを保証
  test "GET /api/todos filters by completed" do
    get "/api/todos", params: { completed: true }
    assert_response :success

    json = JSON.parse(response.body)
    assert json["data"].all? { |t| t["completed"] == true }
  end

  # 概要: Todo詳細APIの基本動作をテスト
  # 目的: /api/todos/:id が200を返し、指定TodoのJSONを返却することを保証
  test "GET /api/todos/:id returns item" do
    get "/api/todos/#{@todo.id}"
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal @todo.id, json["data"]["id"]
    assert_equal @todo.text, json["data"]["text"]
  end

  # 概要: Todo作成APIの成功ケースをテスト
  # 目的: 有効な text, category_id で201が返り、レコードが作成されることを保証
  test "POST /api/todos creates item" do
    assert_difference("Todo.count", 1) do
      post "/api/todos", params: { text: "新しいTodo", category_id: @category.id, completed: false }, as: :json
    end
    assert_response :created

    json = JSON.parse(response.body)
    assert_equal "新しいTodo", json["data"]["text"]
    assert_equal @category.id, json["data"]["category_id"]
    assert_equal false, json["data"]["completed"]
  end

  # 概要: Todo作成APIのバリデーションエラーをテスト
  # 目的: text未指定のとき422とエラー形式のJSONを返すことを保証
  test "POST /api/todos returns 422 on validation error" do
    assert_no_difference("Todo.count") do
      post "/api/todos", params: { text: "", category_id: @category.id }, as: :json
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

  # 概要: Todo更新APIの成功ケースをテスト
  # 目的: textとcompletedが更新され200が返ることを保証
  test "PUT /api/todos/:id updates item" do
    put "/api/todos/#{@todo.id}", params: { text: "修正済み", completed: true, category_id: @other_category.id }, as: :json
    assert_response :success

    @todo.reload
    assert_equal "修正済み", @todo.text
    assert_equal true, @todo.completed
    assert_equal @other_category.id, @todo.category_id
  end

  # 概要: Todo削除APIの成功ケースをテスト
  # 目的: 204 No Contentが返り、レコードが削除されることを保証
  test "DELETE /api/todos/:id deletes item" do
    assert_difference("Todo.count", -1) do
      delete "/api/todos/#{@todo.id}"
    end
    assert_response :no_content
  end

  # 概要: 存在しないIDアクセス時のエラーハンドリングをテスト
  # 目的: RecordNotFound時に404とエラーJSONが返ることを保証
  test "GET /api/todos/:id returns 404 when not found" do
    get "/api/todos/999999"
    assert_response :not_found

    json = JSON.parse(response.body)
    assert json["errors"].is_a?(Array)
    assert_equal "NOT_FOUND", json["errors"].first["code"]
    assert_equal "Not Found", json["errors"].first["message"]
    refute json["errors"].first.key?("field"), "404エラーにfieldは含めない"
  end

  # 概要: DB接続エラー時の500レスポンスをテスト
  # 目的: DB未接続(ActiveRecord::ConnectionNotEstablished)で500と統一形式のエラーを返すことを保証
  test "GET /api/todos returns 500 on DB connection error" do
    get "/api/todos", headers: { 'X-Force-Db-Error' => '1' }
    assert_response :internal_server_error
    json = JSON.parse(response.body)
    assert json["errors"].is_a?(Array)
    assert_equal "INTERNAL_SERVER_ERROR", json["errors"].first["code"]
    assert_match /Database connection/i, json["errors"].first["message"]
    refute json["errors"].first.key?("field"), "500エラーにfieldは含めない"
  end
end
