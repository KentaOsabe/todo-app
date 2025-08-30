module Api
  class CategoriesController < ApplicationController
    def index
      sort = params[:sort].presence_in(%w[id name created_at]) || "id"
      direction = params[:order].to_s.downcase == "desc" ? :desc : :asc
      categories = Category.all.order(sort => direction)
      render json: { data: categories.as_json(only: [:id, :name, :created_at, :updated_at]) }
    end

    def show
      category = Category.find(params[:id])
      render json: { data: category.as_json(only: [:id, :name, :created_at, :updated_at]) }
    end

    def create
      category = Category.new(category_params)
      if category.save
        render json: { data: category.as_json(only: [:id, :name, :created_at, :updated_at]) }, status: :created
      else
        render json: { errors: format_errors(category) }, status: :unprocessable_content
      end
    end

    def update
      category = Category.find(params[:id])
      if category.update(category_params)
        render json: { data: category.as_json(only: [:id, :name, :created_at, :updated_at]) }
      else
        render json: { errors: format_errors(category) }, status: :unprocessable_content
      end
    end

    def destroy
      category = Category.find(params[:id])
      category.destroy
      head :no_content
    end

    private

    def category_params
      params.permit(:name)
    end

    def format_errors(record)
      record.errors.map do |error|
        { code: "VALIDATION_ERROR", field: error.attribute, message: error.full_message }
      end
    end
  end
end
