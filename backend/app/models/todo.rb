class Todo < ApplicationRecord
  belongs_to :category
  
  validates :text, presence: true
  validates :completed, inclusion: { in: [true, false] }
end
