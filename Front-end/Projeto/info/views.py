from django.shortcuts import render

from django.shortcuts import render

def sobre_view(request):
    # Alterado para usar o nome do arquivo HTML existente (humap.html)
    return render(request, 'sobre/sobre.html', {})

def contato_view(request):
    # Exemplo: Uma página de contato
    return render(request, 'info/contato.html', {})

# Adicione outras views conforme as telas que você tem para "info"