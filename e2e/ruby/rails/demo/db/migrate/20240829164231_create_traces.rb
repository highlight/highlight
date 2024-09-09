class CreateTraces < ActiveRecord::Migration[7.0]
  def change
    create_table :traces do |t|
      t.string :name
      t.string :kind

      t.timestamps
    end
  end
end
