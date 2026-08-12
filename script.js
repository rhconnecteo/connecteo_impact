// ================================================================
// CONFIGURATION API
// ================================================================
// Remplacez par l'URL de votre Web App déployée
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbx_9MoTAF1EDc3hTV6EEkYpifLH7t5oWFRWYBPMNqMdGrPIzlyO0UlVIwKaRmOPGRoBQA/exec';

// ================================================================
// État + appels API REST optimisés
// ================================================================
let donneesMatricule = [];
let chargementEnCours = false;

function setActive(id) {
  document.getElementById('btn-matricule').classList.remove('is-active');
  document.getElementById('btn-pole').classList.remove('is-active');
  document.getElementById(id).classList.add('is-active');
}

function showLoading() {
  document.getElementById('panel').innerHTML =
    '<div class="loading-state"><div class="spinner"></div>Chargement des données…</div>';
}

function showError(msg) {
  document.getElementById('panel').innerHTML =
    '<div class="error-state">⚠️ ' + msg + '</div>';
}

// ----- Fonction avec cache et timeout plus long -----
async function callAPI(endpoint) {
  // Vérifier le cache localStorage d'abord (ultra-rapide)
  const cacheKey = 'dashboard_' + endpoint;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      const timestamp = data.timestamp || 0;
      // Cache valable 10 minutes
      if (Date.now() - timestamp < 600000) {
        return data.value;
      }
    } catch (e) {}
  }
  
  const url = API_BASE_URL + '?endpoint=' + endpoint;
  
  // Timeout augmenté à 15 secondes (Google Apps Script peut être lent)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error('Erreur HTTP: ' + response.status);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }
    
    // Sauvegarder dans le cache local
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      value: data
    }));
    
    return data;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return await callAPIWithProxy(endpoint);
    }
    
    // Si l'erreur est CORS, essayer avec un proxy
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      return await callAPIWithProxy(endpoint);
    }
    throw error;
  }
}

// ----- Fonction avec proxy CORS (AllOrigins) -----
async function callAPIWithProxy(endpoint) {
  const originalUrl = API_BASE_URL + '?endpoint=' + endpoint;
  const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(originalUrl);
  
  // Timeout plus long pour le proxy (30 secondes)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(proxyUrl, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error('Erreur proxy: ' + response.status);
    }
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Le proxy a pris trop de temps. Vérifiez votre connexion Internet.');
    }
    throw new Error('Impossible de contacter l\'API: ' + error.message);
  }
}

// ----- Bouton 1 : points par matricule avec affichage progressif -----
function afficherParMatricule() {
  if (chargementEnCours) return;
  
  setActive('btn-matricule');
  document.getElementById('search-row').style.display = 'block';
  showLoading();
  chargementEnCours = true;

  // Utiliser les données du cache si disponibles
  const cacheKey = 'dashboard_matricules';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      const timestamp = data.timestamp || 0;
      if (Date.now() - timestamp < 600000) {
        donneesMatricule = data.value.data;
        renderMatriculesProgressively(data.value.data);
        chargementEnCours = false;
        return;
      }
    } catch (e) {}
  }

  callAPI('matricules')
    .then(function (response) {
      donneesMatricule = response.data;
      renderMatriculesProgressively(response.data);
      chargementEnCours = false;
    })
    .catch(function (error) {
      // En cas d'erreur, essayer d'utiliser le cache même expiré
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          donneesMatricule = data.value.data;
          renderMatriculesProgressively(data.value.data);
          chargementEnCours = false;
          return;
        } catch (e) {}
      }
      showError(error.message);
      chargementEnCours = false;
    });
}

// ----- Rendu progressif (les données apparaissent ligne par ligne) -----
function renderMatriculesProgressively(data) {
  if (!data || data.length === 0) {
    document.getElementById('panel').innerHTML = '<div class="empty-state">Aucune donnée trouvée dans la feuille.</div>';
    return;
  }

  const panel = document.getElementById('panel');
  
  // Créer la structure du tableau immédiatement
  panel.innerHTML =
    '<div class="card">' +
      '<h2>Points par matricule</h2>' +
      '<div class="meta">' + data.length + ' collaborateur(s)</div>' +
      '<div style="max-height:500px;overflow-y:auto;">' +
        '<table id="tbl-matricule">' +
          '<thead><tr><th>Matricule</th><th>Nom et Prénoms</th><th>Pôle</th><th>Point</th></tr></thead>' +
          '<tbody id="table-body"></tbody>' +
        '</table>' +
      '</div>' +
    '</div>';
  
  const tbody = document.getElementById('table-body');
  let currentIndex = 0;
  const batchSize = 50;
  
  // Fonction pour ajouter des lignes par lots
  function addNextBatch() {
    const endIndex = Math.min(currentIndex + batchSize, data.length);
    const fragment = document.createDocumentFragment();
    
    for (let i = currentIndex; i < endIndex; i++) {
      const r = data[i];
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + r.matricule + '</td>' +
        '<td>' + r.nom + '</td>' +
        '<td>' + r.pole + '</td>' +
        '<td class="pt">' + r.point + '</td>';
      fragment.appendChild(tr);
    }
    
    tbody.appendChild(fragment);
    currentIndex = endIndex;
    
    if (currentIndex < data.length) {
      requestAnimationFrame(addNextBatch);
    }
  }
  
  requestAnimationFrame(addNextBatch);
}

// ----- Version rapide pour le filtrage -----
function renderMatricules(data) {
  if (!data || data.length === 0) {
    document.getElementById('panel').innerHTML = '<div class="empty-state">Aucune donnée trouvée dans la feuille.</div>';
    return;
  }

  let rows = '';
  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    rows += '<tr>' +
      '<td>' + r.matricule + '</td>' +
      '<td>' + r.nom + '</td>' +
      '<td>' + r.pole + '</td>' +
      '<td class="pt">' + r.point + '</td>' +
      '</tr>';
  }

  document.getElementById('panel').innerHTML =
    '<div class="card">' +
      '<h2>Points par matricule</h2>' +
      '<div class="meta">' + data.length + ' collaborateur(s)</div>' +
      '<div style="max-height:500px;overflow-y:auto;">' +
        '<table id="tbl-matricule">' +
          '<thead><tr><th>Matricule</th><th>Nom et Prénoms</th><th>Pôle</th><th>Point</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>';
}

function filtrerMatricules() {
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  if (q === '') {
    renderMatricules(donneesMatricule);
  } else {
    const filtered = donneesMatricule.filter(function (r) {
      return r.matricule.toLowerCase().includes(q) || r.nom.toLowerCase().includes(q);
    });
    renderMatricules(filtered);
  }
}

// ----- Bouton 2 : total par pôle (affichage instantané) -----
function afficherParPole() {
  if (chargementEnCours) return;
  
  setActive('btn-pole');
  document.getElementById('search-row').style.display = 'none';
  showLoading();
  chargementEnCours = true;

  // Utiliser les données du cache si disponibles
  const cacheKey = 'dashboard_poles';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      const timestamp = data.timestamp || 0;
      if (Date.now() - timestamp < 600000) {
        renderPoles(data.value.data);
        chargementEnCours = false;
        return;
      }
    } catch (e) {}
  }

  callAPI('poles')
    .then(function (response) {
      renderPoles(response.data);
      chargementEnCours = false;
    })
    .catch(function (error) {
      // En cas d'erreur, essayer d'utiliser le cache même expiré
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          renderPoles(data.value.data);
          chargementEnCours = false;
          return;
        } catch (e) {}
      }
      showError(error.message);
      chargementEnCours = false;
    });
}

function renderPoles(data) {
  if (!data || data.length === 0) {
    document.getElementById('panel').innerHTML = '<div class="empty-state">Aucune donnée trouvée dans la feuille.</div>';
    return;
  }

  const max = Math.max.apply(null, data.map(function (d) { return d.total; }));
  const medals = ['🥇', '🥈', '🥉'];

  let rows = '';
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const pct = max > 0 ? Math.round((d.total / max) * 100) : 0;
    const medal = medals[i] || '';
    rows += '<div class="bar-row">' +
      '<div class="rank-name"><span class="medal">' + medal + '</span>' + d.pole + '</div>' +
      '<div class="bar-track"><div class="bar-fill" data-pct="' + pct + '"></div></div>' +
      '<div class="pt">' + d.total + '</div>' +
      '</div>';
  }

  document.getElementById('panel').innerHTML =
    '<div class="card">' +
      '<h2>Total des points par pôle</h2>' +
      '<div class="meta">' + data.length + ' pôle(s)</div>' +
      rows +
    '</div>';

  requestAnimationFrame(function () {
    document.querySelectorAll('.bar-fill').forEach(function (el) {
      el.style.width = el.getAttribute('data-pct') + '%';
    });
  });
}

// ================================================================
// PRÉCHARGEMENT AU DÉMARRAGE
// ================================================================
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    callAPI('matricules')
      .then(function (response) {
        donneesMatricule = response.data;
      })
      .catch(function (error) {});
  }, 1000);
});

// Rendre les fonctions globales pour onclick
window.afficherParMatricule = afficherParMatricule;
window.afficherParPole = afficherParPole;
window.filtrerMatricules = filtrerMatricules;
