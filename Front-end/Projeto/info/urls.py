from django.urls import path
from . import views

app_name = 'info' # Corrigido

urlpatterns = [
    # URL: /info/sobre/
    path('sobre/', views.sobre_view, name='sobre'),

    # URL: /info/contato/
    path('contato/', views.contato_view, name='contato_info'),
    
    # ... adicione outras URLs específicas de info aqui
]