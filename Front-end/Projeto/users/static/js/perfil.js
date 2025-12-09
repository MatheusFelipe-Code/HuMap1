// O código de menu, sidebar e notificação foi removido e agora é controlado pelo base/base.html

// SUGESTÕES DE ENDEREÇO (Movido para global para não conflitar com o base.html)
window.showSuggestions = function() {
    const input = document.getElementById("searchInput").value;
    const box = document.getElementById("suggestions");

    if (input.length < 2) {
        box.innerHTML = "";
        box.style.display = "none";
        return;
    }

    const ruas = ["Rua Safira", "Rua Topázio", "Rua Esmeralda", "Rua Rubi"];

    const filtrado = ruas.filter(r => r.toLowerCase().includes(input.toLowerCase()));

    box.innerHTML = filtrado
        .map(r => `<p onclick="selectStreet('${r}')">${r}</p>`)
        .join("");

    box.style.display = "block";
}

window.selectStreet = function(nomeRua) {
    alert("Indo para " + nomeRua);
}

window.goToSearch = function() {
    const valor = document.getElementById("searchInput").value;
    if (!valor) return alert("Digite um destino.");
    alert("Buscando: " + valor);
}