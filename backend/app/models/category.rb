class Category < ApplicationRecord
  has_many :todos, dependent: :destroy
  
  validates :name, presence: true, uniqueness: true, length: { maximum: 255 }

  def usage_summary
    todos_count = todos.count
    {
      in_use: todos_count.positive?,
      counts: {
        todos: todos_count,
      },
    }
  end
end
