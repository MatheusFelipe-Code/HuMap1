/* =============================================================
   CONFIGURAÇÕES GLOBAIS E DADOS
   ============================================================= */

var defaultLat = -23.55052,
    defaultLng = -46.633308;

var map, userMarker, reportsLayer;

// 1. DEFINIÇÃO DE ÍCONES (CORREÇÃO APLICADA)
// Em vez de URLs fixas, usamos o objeto global populado pelo Django no home.html
const ICONS_SOURCE = window.STATIC_URLS || {};

// 2. PADRONIZAÇÃO DOS TÍTULOS (Isso garante que o nome salvo seja sempre igual)
const CLEAN_TITLES = {
    violencia: "Violência Urbana",
    saneamento: "Saneamento Básico",
    planejamento: "Infraestrutura Urbana", // A chave é 'planejamento', o texto é 'Infraestrutura'
    meioambiente: "Meio Ambiente",
};

// 3. SUBTEMAS
const SUBTEMAS = {
    violencia: [
        { value: "assalto_pessoa", text: "Assalto/Roubo a pessoa" },
        { value: "furto_veiculo", text: "Furto de Veículo" },
        { value: "trafico", text: "Tráfico de drogas" },
        { value: "briga_desordem", text: "Briga/Desordem (Vandalismo)" },
        { value: "violencia_domestica", text: "Violência doméstica" },
        { value: "ameaca", text: "Ameaça" },
        { value: "homicidio", text: "Homicídio/Tentativa" },
        { value: "sequestro", text: "Sequestro" },
        { value: "violencia_sexual", text: "Violência sexual" },
        { value: "latrocinio", text: "Latrocínio" }
    ],
    saneamento: [
        { value: "falta_agua", text: "Falta de água" },
        { value: "esgoto_aberto", text: "Esgoto a céu aberto" },
        { value: "lixo_acumulado", text: "Lixo acumulado" },
        { value: "alagamento", text: "Alagamento" },
        { value: "falta_coleta", text: "Falta de coleta de lixo" },
        { value: "cheiro_esgoto", text: "Cheiro forte de esgoto" },
        { value: "vazamento_rede", text: "Vazamento na rede de água" },
        { value: "fossa_estourada", text: "Fossa estourada" }
    ],
    planejamento: [ // Note que a chave aqui é 'planejamento'
        { value: "buracos_via", text: "Buracos na via/Asfalto ruim" },
        { value: "falta_iluminacao", text: "Falta ou falha na iluminação pública" },
        { value: "sinalizacao_ruim", text: "Sinalização ruim" },
        { value: "calcada_danificada", text: "Calçada danificada" },
        { value: "falta_acessibilidade", text: "Falta de acessibilidade" },
        { value: "transporte_insuficiente", text: "Transporte público insuficiente" },
        { value: "ponto_onibus_ruim", text: "Ponto de ônibus danificado" },
        { value: "semaforo_apagado", text: "Semáforo apagado" },
        { value: "obstrucao_calcada", text: "Obstrução de calçada" }
    ],
    meioambiente: [
        { value: "corte_ilegal_arvores", text: "Corte ilegal de árvores" },
        { value: "poluicao_rios", text: "Poluição de rios" },
        { value: "queimadas", text: "Queimadas" },
        { value: "maus_tratos_animais", text: "Maus-tratos animais" },
        { value: "descarte_irregular_lixo", text: "Descarte irregular de lixo" },
        { value: "poluicao_sonora", text: "Poluição sonora" },
        { value: "animal_abandonado", text: "Animal abandonado" }
    ]
};

// Dados simulados para teste
var activeReports = [
  {
    tipo: 'Meio Ambiente - Descarte irregular', 
    descricao: 'Árvore caída bloqueando a rua.',
    lat: -23.5620,
    lng: -46.6560,
    data: new Date().toLocaleDateString('pt-BR')
  },
  {
    tipo: 'Violência Urbana - Roubo',
    descricao: 'Assalto a pedestre.',
    lat: -23.5600,
    lng: -46.6560,
    data: new Date().toLocaleDateString('pt-BR')
  },
  {
    tipo: 'Saneamento Básico - Falta de energia',
    descricao: 'Falta de energia na região.',
    lat: -23.5550,
    lng: -46.6450,
    data: new Date().toLocaleDateString('pt-BR')
  },
  {
    tipo: 'Infraestrutura Urbana - Buraco na Via',
    descricao: 'Buraco grande na avenida.',
    lat: -23.5580,
    lng: -46.6380,
    data: new Date().toLocaleDateString('pt-BR')
  }
];

/* =============================================================
   FUNÇÕES AUXILIARES (NORMALIZAÇÃO E CATEGORIZAÇÃO)
   ============================================================= */

// Remove acentos e converte para minúsculo (ex: "Violência" vira "violencia")
function normalizeText(text) {
    if (!text) return "";
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Descobre a Categoria (chave) baseada no Título da Denúncia
function getCategoryFromType(title) {
    const norm = normalizeText(title);

    if (norm.includes('violencia')) return 'violencia';
    if (norm.includes('saneamento')) return 'saneamento';
    // Aqui garantimos que "Infraestrutura" seja lido como "planejamento"
    if (norm.includes('infraestrutura') || norm.includes('planejamento')) return 'planejamento';
    if (norm.includes('meio ambiente')) return 'meioambiente';
    
    return 'outros';
}

/* =============================================================
   LÓGICA DO MAPA
   ============================================================= */

function initializeMap() {
    if (document.getElementById("map")) {
        map = L.map("map").setView([defaultLat, defaultLng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
        }).addTo(map);

        reportsLayer = L.layerGroup().addTo(map);
        userMarker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
        
        setupMapEvents();
        updateCoords(defaultLat, defaultLng);
        loadReportsOnMap(); // Carrega os pontos iniciais
    }
}

function setupMapEvents() {
    map.on("click", function (e) {
      userMarker.setLatLng(e.latlng);
      updateCoords(e.latlng.lat, e.latlng.lng);
    });

    userMarker.on("dragend", function () {
      var pos = userMarker.getLatLng();
      updateCoords(pos.lat, pos.lng);
    });

    const locBtn = document.getElementById("locBtn");
    if(locBtn) {
        locBtn.addEventListener("click", function (e) {
          e.preventDefault();
          getUserLocation();
        });
    }
}

// (CORREÇÃO APLICADA) Define o ícone com base na categoria usando STATIC_URLS
function getReportIcon(reportType) {
    const category = getCategoryFromType(reportType);
    
    // Tenta pegar a URL do static do Django, ou usa um fallback padrão se não encontrar
    let iconUrl = ICONS_SOURCE[category];
    
    // Se por algum motivo a imagem não carregar ou category for 'outros', usa um ícone padrão azul
    if (!iconUrl) {
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
    }

    return L.icon({
        iconUrl: iconUrl,
        // Sombra opcional (muitas vezes ícones planos ficam melhores sem a sombra padrão do Leaflet, 
        // mas você pode descomentar se quiser)
        // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        
        // AJUSTE DE TAMANHO: 35x35 é bom para ícones ilustrativos PNG
        iconSize: [35, 35], 
        
        // O ponto onde o ícone "toca" o mapa (centro da imagem)
        iconAnchor: [17, 17], 
        
        // Onde o balão de texto abre em relação ao ícone
        popupAnchor: [0, -20]
        // shadowSize: [41, 41]
    });
}

// Carrega e filtra os relatórios no mapa
function loadReportsOnMap() {
    if (!reportsLayer) return;
    
    // Pega o valor do filtro selecionado no HTML (input hidden)
    const filterInput = document.getElementById("reportFilter");
    const filterValue = filterInput ? filterInput.value : 'todos'; // Ex: 'todos', 'violencia', 'planejamento'
    
    reportsLayer.clearLayers();

    activeReports.forEach(report => {
        // Pega a categoria da denúncia (ex: converte "Infraestrutura Urbana" para "planejamento")
        const reportCategory = getCategoryFromType(report.tipo);
        
        // Lógica de exibição: Mostra se o filtro for 'todos' OU se a categoria bater
        const shouldDisplay = (filterValue === 'todos' || filterValue === reportCategory);

        if (shouldDisplay) {
            const icon = getReportIcon(report.tipo); 
            const reportMarker = L.marker([report.lat, report.lng], { icon: icon }).addTo(reportsLayer);
            
            const popupContent = `
                <div style="text-align:center;">
                    <h6 style="color: #005BB5; font-weight:bold; margin-bottom: 5px;">${report.tipo}</h6>
                    <p style="margin: 5px 0; font-size:13px;">${report.descricao}</p>
                    <small style="color:#666;">Data: ${report.data}</small>
                </div>
            `;
            reportMarker.bindPopup(popupContent);
        }
    });
}

function updateCoords(lat, lng) {
  if (document.getElementById("lat")) {
    document.getElementById("lat").value = lat;
    document.getElementById("lng").value = lng;
    document.getElementById("coords").textContent =
      "Lat: " + lat.toFixed(5) + " | Lng: " + lng.toFixed(5);
  }
}

/* =============================================================
   INTERATIVIDADE (DROPDOWN, UPLOAD, SUBTEMAS)
   ============================================================= */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- Lógica de Upload ---
    const fileInput = document.getElementById("fileInput");
    const fileList = document.getElementById("fileList");
    if (fileInput) {
        document.getElementById("addFile").addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", () => {
          fileList.innerHTML = "";
          Array.from(fileInput.files).forEach((file, idx) => {
            const span = document.createElement("span");
            span.textContent = file.name;
            span.style.marginRight="10px";
            const removeIcon = document.createElement("i");
            removeIcon.className = "bi bi-x";
            removeIcon.style.cursor="pointer";
            removeIcon.onclick = () => {
              const dt = new DataTransfer();
              Array.from(fileInput.files).forEach((f, i) => { if (i !== idx) dt.items.add(f); });
              fileInput.files = dt.files;
              span.remove();
            };
            span.appendChild(removeIcon);
            fileList.appendChild(span);
          });
        });
    }

    // --- Lógica dos Subtemas ---
    const tipoSelect = document.getElementById("tipo");
    const subtemaContainer = document.getElementById("subtemaContainer");
    const subtemaSelect = document.getElementById("subtema");

    if (tipoSelect) {
        tipoSelect.addEventListener("change", function() {
            const tipo = this.value; // ex: 'violencia', 'planejamento'
            subtemaSelect.innerHTML = '<option value="" selected>Selecione o subtipo</option>';
            
            if (tipo && SUBTEMAS[tipo]) {
                SUBTEMAS[tipo].forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub.value;
                    opt.textContent = sub.text;
                    subtemaSelect.appendChild(opt);
                });
                subtemaContainer.classList.remove('d-none');
            } else {
                subtemaContainer.classList.add('d-none');
            }
        });
    }

    // --- Lógica do Filtro Dropdown ---
    const filterDropdownMenu = document.getElementById('filterDropdownMenu');
    if (filterDropdownMenu) {
        const reportFilterInput = document.getElementById('reportFilter');
        const filterDropdownButton = document.getElementById('filterDropdownButton');
        
        filterDropdownMenu.addEventListener('click', function(e) {
            // Verifica a classe usada no HTML (.opcao-filtro-home ou .dropdown-item)
            const item = e.target.closest('.opcao-filtro-home') || e.target.closest('.dropdown-item'); 
            
            if (item) {
                e.preventDefault();
                // O data-filter deve ser: 'todos', 'violencia', 'saneamento', 'planejamento', 'meioambiente'
                const newFilterValue = item.getAttribute('data-filter'); 
                const newFilterText = item.textContent;

                // Atualiza o input oculto e o texto do botão
                reportFilterInput.value = newFilterValue;
                filterDropdownButton.innerHTML = `<i class="bi bi-funnel"></i> ${newFilterText}`;

                // Marca ativo visualmente
                const allItems = filterDropdownMenu.querySelectorAll('a');
                allItems.forEach(el => el.classList.remove('active'));
                item.classList.add('active');

                // Recarrega o mapa aplicando o filtro
                loadReportsOnMap();
            }
        });
    }
});

/* =============================================================
   ENVIO DA DENÚNCIA
   ============================================================= */

window.handleReportSubmission = function(e) {
  e.preventDefault(); 
  
  const tipoKey = document.getElementById("tipo").value; // ex: 'planejamento'
  const subtemaKey = document.getElementById("subtema").value;
  const subtemaText = document.getElementById("subtema").options[document.getElementById("subtema").selectedIndex]?.text;
  const descricao = document.getElementById("descricao").value;
  const lat = parseFloat(document.getElementById("lat").value);
  const lng = parseFloat(document.getElementById("lng").value);
  
  if (!tipoKey || !descricao.trim() || isNaN(lat)) {
    alert("Por favor, preencha o tipo, a descrição e selecione um local no mapa.");
    // Reabre modal se fechou
    if(window.bootstrap) {
        const reportModal = document.getElementById("reportModal");
        const modalInstance = bootstrap.Modal.getOrCreateInstance(reportModal);
        modalInstance.show();
    }
    return;
  }

  // 1. Pega o Título Limpo usando a chave (Isso garante que "Infraestrutura" fique com o nome correto)
  let tituloPrincipal = CLEAN_TITLES[tipoKey]; 
  
  // Se por acaso CLEAN_TITLES não tiver a chave, usa o próprio value capitalizado
  if (!tituloPrincipal) {
      tituloPrincipal = tipoKey.charAt(0).toUpperCase() + tipoKey.slice(1);
  }

  // 2. Monta o título completo
  const tituloCompleto = subtemaKey ? `${tituloPrincipal} - ${subtemaText}` : tituloPrincipal;

  // 3. Salva no Array
  const newReport = { 
      tipo: tituloCompleto, 
      descricao: descricao, 
      lat: lat, 
      lng: lng, 
      data: new Date().toLocaleDateString('pt-BR') 
  };
  
  activeReports.push(newReport);

  // 4. Atualiza o Mapa
  loadReportsOnMap();

  // 5. Limpeza e UI
  document.getElementById("descricao").value = '';
  document.getElementById("tipo").value = '';
  document.getElementById("subtema").value = '';
  document.getElementById("subtemaContainer").classList.add('d-none');
  
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  if(fileInput) fileInput.files = new DataTransfer().files;
  if(fileList) fileList.innerHTML = '';
  
  updateCoords(defaultLat, defaultLng);
  userMarker.setLatLng([defaultLat, defaultLng]);
  
  // Fecha modal atual e abre sucesso
  if(window.bootstrap) {
      const reportModalEl = document.getElementById("reportModal");
      const reportModal = bootstrap.Modal.getInstance(reportModalEl);
      if(reportModal) reportModal.hide();

      setTimeout(() => {
          const successModal = new bootstrap.Modal(document.getElementById("successModal"));
          successModal.show();
      }, 150);
  }
};

/* =============================================================
   GEOLOCALIZAÇÃO E BUSCA
   ============================================================= */

function getUserLocation(callback) {
  const locBtn = document.getElementById("locBtn");
  if (!navigator.geolocation) {
    return; // Silencioso se não suportar
  }
  
  if (locBtn) {
    locBtn.disabled = true;
    locBtn.textContent = "Localizando...";
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      userMarker.setLatLng([lat, lng]);
      updateCoords(lat, lng);
      map.setView([lat, lng], 16);
      if (locBtn) { locBtn.disabled = false; locBtn.innerHTML = '<i class="bi bi-geo-alt-fill"></i> Usar minha localização'; }
      if (callback) callback(true);
    },
    (err) => {
      console.log("Erro loc:", err);
      if (locBtn) { locBtn.disabled = false; locBtn.innerHTML = '<i class="bi bi-geo-alt-fill"></i> Usar minha localização'; }
      if (callback) callback(false);
    }, 
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
}

// Busca de endereço (Nominatim)
async function geocodeAndMoveMap(query) {
    if (!query) return;
    const cleanQuery = query.replace(/[^\d]/g, '');
    let url = '';
    
    if (/^\d{8}$/.test(cleanQuery) || /^\d{5}-\d{3}$/.test(query)) {
        url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(cleanQuery)}&country=Brazil&format=json&limit=1`;
    } else {
        url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`;
    }
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            map.setView([lat, lng], 16);
            userMarker.setLatLng([lat, lng]);
            updateCoords(lat, lng);
        } else {
            alert("Local não encontrado.");
        }
    } catch (e) {
        console.error(e);
    }
}

window.goToSearch = function() {
    const searchInput = document.getElementById("searchInput");
    if(searchInput && searchInput.value) {
        geocodeAndMoveMap(searchInput.value);
    } else {
        alert("Digite um local para pesquisar.");
    }
}

// Inicialização ao carregar a página
window.addEventListener("load", () => {
    if (document.getElementById("map")) {
        initializeMap();
        setTimeout(() => map.invalidateSize(), 100);
        getUserLocation(null);
    }
});