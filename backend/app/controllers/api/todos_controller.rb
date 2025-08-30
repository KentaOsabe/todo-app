module Api
  class TodosController < ApplicationController
    ALLOWED_SORTS = %w[id created_at text].freeze
    ALLOWED_ORDERS = %w[asc desc].freeze
    def index
      todos = Todo.all
      if params.key?(:completed)
        completed = ActiveModel::Type::Boolean.new.cast(params[:completed])
        todos = todos.where(completed: completed)
      end
      if params[:category_id].present?
        todos = todos.where(category_id: params[:category_id])
      end
      # sorting
      sort = ALLOWED_SORTS.include?(params[:sort]) ? params[:sort] : "id"
      direction = ALLOWED_ORDERS.include?(params[:order].to_s.downcase) ? params[:order].to_s.downcase.to_sym : :asc
      todos = todos.order(sort => direction)
      render json: { data: todos.as_json(only: [:id, :text, :completed, :category_id, :created_at, :updated_at]) }
    end

    def show
      todo = Todo.find(params[:id])
      render json: { data: todo.as_json(only: [:id, :text, :completed, :category_id, :created_at, :updated_at]) }
    end

    def create
      todo = Todo.new(todo_params)
      if todo.save
        render json: { data: todo.as_json(only: [:id, :text, :completed, :category_id, :created_at, :updated_at]) }, status: :created
      else
        render json: { errors: format_errors(todo) }, status: :unprocessable_content
      end
    end

    def update
      todo = Todo.find(params[:id])
      if todo.update(todo_params)
        render json: { data: todo.as_json(only: [:id, :text, :completed, :category_id, :created_at, :updated_at]) }
      else
        render json: { errors: format_errors(todo) }, status: :unprocessable_content
      end
    end

    def destroy
      todo = Todo.find(params[:id])
      todo.destroy
      head :no_content
    end

    private

    def todo_params
      params.permit(:text, :completed, :category_id)
    end
  end
end
