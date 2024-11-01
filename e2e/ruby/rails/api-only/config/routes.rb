Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  root to: 'health#index'

  get 'health', to: 'health#index'
  get 'error', to: 'health#error'
end
