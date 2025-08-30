# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Create categories
categories = [
  "仕事",
  "プライベート",
  "買い物",
  "健康",
  "学習"
]

categories.each do |category_name|
  Category.find_or_create_by!(name: category_name)
end

# Create todos for each category
work_category = Category.find_by(name: "仕事")
private_category = Category.find_by(name: "プライベート")
shopping_category = Category.find_by(name: "買い物")
health_category = Category.find_by(name: "健康")
learning_category = Category.find_by(name: "学習")

todos_data = [
  { text: "プロジェクトの進捗報告書を作成する", completed: false, category: work_category },
  { text: "ミーティング資料を準備する", completed: true, category: work_category },
  { text: "メールを返信する", completed: false, category: work_category },
  
  { text: "友人とディナーの予定を立てる", completed: false, category: private_category },
  { text: "映画を観る", completed: true, category: private_category },
  { text: "家族に電話をかける", completed: false, category: private_category },
  
  { text: "牛乳を買う", completed: false, category: shopping_category },
  { text: "パンを買う", completed: false, category: shopping_category },
  { text: "野菜を買う", completed: true, category: shopping_category },
  
  { text: "ジムに行く", completed: false, category: health_category },
  { text: "健康診断を受ける", completed: true, category: health_category },
  { text: "ウォーキングをする", completed: false, category: health_category },
  
  { text: "Railsの勉強をする", completed: false, category: learning_category },
  { text: "英語の勉強をする", completed: true, category: learning_category },
  { text: "技術書を読む", completed: false, category: learning_category }
]

todos_data.each do |todo_data|
  Todo.find_or_create_by!(
    text: todo_data[:text], 
    category: todo_data[:category]
  ) do |todo|
    todo.completed = todo_data[:completed]
  end
end
