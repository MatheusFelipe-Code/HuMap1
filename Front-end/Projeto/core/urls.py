from django.urls import path
from . import views

app_name = 'core' # Corrigido

urlpatterns = [
    # URL: / (Acesso à raiz do aplicativo - Mapa/Home)
    path('', views.home_view, name='home'),

    # URL: /cadastro/
    path('cadastro/', views.cadastro_view, name='cadastro'),

    # URL: /login/
    path('login/', views.login_view, name='login'),
    
    # URL: /configuracao/
    path('configuracao/', views.configuracao_view, name='configuracao'),
    
    path('suporte/', views.suporte_view, name='suporte'),

    path('tutorial/', views.tutorial_view, name='tutorial'),
    
    # Novas rotas que existiam nos views, mas não nos urls
    path('feed/', views.feed_view, name='feed'), 
    
    # A rota 'sobre' foi removida para usar info:sobre.
]