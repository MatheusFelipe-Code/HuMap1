from django.shortcuts import render


# 1. Tela Home
def home_view(request):
    return render(request, 'home/home.html', {}) 

def cadastro_view(request):
    return render(request, 'cadastro/cadastro.html', {})

def login_view(request):
    return render(request, 'login/login.html', {})

def configuracao_view(request):
    return render(request, 'configuracao/configuracao.html', {})


def tutorial_view(request):
    return render(request, 'tutorial/tutorial.html', {})

def feed_view(request):
    return render(request, 'feed/feed.html', {})

def suporte_view(request):
    return render(request, 'suporte/suporte.html', {})
# core/views.py

# A sobre_view foi removida para evitar conflito com info/views.py
# def sobre_view(request):
#     return render(request, 'info/sobre.html', {})

# ... e assim por diante
# 5. Outras Views (sobrernos, Tela de perfil, Tutorial)
# Você deve criar funções semelhantes para as outras páginas que você tem.
# Ex: def perfil_view(request):
#         return render(request, 'core/Tela de perfil/Tela de perfil.html', {})