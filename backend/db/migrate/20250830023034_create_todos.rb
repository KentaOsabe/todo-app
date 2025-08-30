class CreateTodos < ActiveRecord::Migration[8.0]
  def change
    create_table :todos do |t|
      t.text :text, null: false
      t.boolean :completed, default: false
      t.references :category, null: false, foreign_key: true

      t.timestamps
    end
  end
end
