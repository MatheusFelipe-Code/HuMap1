from django.shortcuts import render

def perfil_view(request):
    # Tela de perfil do usuário
    return render(request, 'users/perfil/perfil.html', {})

def registro_view(request):
    # Tela para novo cadastro de usuário
    return render(request, 'users/registro/registro.html', {})

def dashboard_view(request):
    # Tela inicial ou dashboard do usuário logado
    return render(request, 'users/dashboard/dashboard.html', {})

def recuperacao_view(request):
    return render(request, 'users/recuperacao/recuperacao.html', {})
# Adicione outras views conforme as telas de gerenciamento de usuário