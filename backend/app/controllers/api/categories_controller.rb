module Api
  class CategoriesController < ApplicationController
    ALLOWED_SORTS = %w[id name created_at].freeze
    ALLOWED_ORDERS = %w[asc desc].freeze
    def index
      sort = ALLOWED_SORTS.include?(params[:sort]) ? params[:sort] : "id"
      direction = ALLOWED_ORDERS.include?(params[:order].to_s.downcase) ? params[:order].to_s.downcase.to_sym : :asc
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
  end
end
