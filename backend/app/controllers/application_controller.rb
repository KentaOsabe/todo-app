class ApplicationController < ActionController::API
  before_action :simulate_db_error_in_test
  rescue_from ActiveRecord::RecordNotFound do
    render json: { errors: [ { code: "NOT_FOUND", message: "Not Found" } ] }, status: :not_found
  end

  rescue_from ActiveRecord::ConnectionNotEstablished do
    render json: { errors: [ { code: "INTERNAL_SERVER_ERROR", message: "Database connection error" } ] }, status: :internal_server_error
  end

  # MySQL接続エラー（念のためドライバ層の例外も捕捉）
  begin
    require 'mysql2'
    rescue_from Mysql2::Error do
      render json: { errors: [ { code: "INTERNAL_SERVER_ERROR", message: "Database connection error" } ] }, status: :internal_server_error
    end
  rescue LoadError
    # mysql2が未ロード環境でも問題なく動くように無視
  end

  private

  def simulate_db_error_in_test
    return unless Rails.env.test?
    header = request.headers['X-Force-Db-Error'] || request.headers['HTTP_X_FORCE_DB_ERROR']
    raise ActiveRecord::ConnectionNotEstablished if header.to_s == '1'
  end
end
