const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
const btnClose = document.getElementById("btn-close");

// ABRE MENU LATERAL
hamburger.onclick = () => {
    menu.classList.add("open");
};

// FECHA MENU
btnClose.onclick = () => {
    menu.classList.remove("open");
};

// A função history.back() do botão "Voltar" foi mantida
// diretamente no HTML, pois é uma função simples e nativa.

// Adicionar a função history.back() ao novo botão fixo.
const btnVoltarFixo = document.querySelector(".btn-voltar-fixo");
if (btnVoltarFixo) {
    btnVoltarFixo.onclick = () => {
        history.back();
    };
}