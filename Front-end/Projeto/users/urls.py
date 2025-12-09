from django.urls import path
from . import views

app_name = 'users' # Mantém o namespace 'users'

urlpatterns = [
    # CORRIGIDO: mudado o nome para 'perfil' para corresponder ao base.html
    path('perfil/', views.perfil_view, name='perfil'), 

    # URL: /users/registro/
    path('registro/', views.registro_view, name='user_registro'),

    # URL: /users/dashboard/
    path('dashboard/', views.dashboard_view, name='user_dashboard'),
    
    path('recuperacao/', views.recuperacao_view, name='user_recuperacao'),
    # ... adicione outras URLs específicas de usuário aqui
]