"""
URL configuration for Projeto project.
...
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Roteador do aplicativo 'core' com namespace 'core'
    path('', include(('core.urls', 'core'), namespace='core')), 
    
    # Roteador do aplicativo 'info' com namespace 'info'
    path('info/', include(('info.urls', 'info'), namespace='info')), 
    
    # Roteador do aplicativo 'users' com namespace 'users'
    path('users/', include(('users.urls', 'users'), namespace='users')), 
]