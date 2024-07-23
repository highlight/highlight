Rails.application.routes.draw do
  get 'pages/home'
  resources :articles, only: [:index, :new]
  resources :traces, only: [:create]
  resources :logs, only: [:create]
  resources :errors, only: [:create]

  root to: "pages#home"
end
