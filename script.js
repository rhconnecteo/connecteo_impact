// ================================================================
// CONFIGURATION API
// ================================================================
// Remplacez par l'URL de votre Web App déployée
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbxok7Iq96q7UyWDmrZ8iXQLANOSLwDhIcQCJKBGxByoNvF2iW6Yg_mzs7DCmnP2nVR1Jw/exec';

// ================================================================
// État + appels API REST avec gestion CORS améliorée
// ================================================================
let donneesMatricule = [];

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

// ----- Fonction générique pour appeler l'API avec gestion CORS -----
async function callAPI(endpoint) {
  const url = API_BASE_URL + '?endpoint=' + endpoint;
  
  try {
    // Option 1: Fetch avec mode cors (par défaut)
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur HTTP: ' + response.status);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }
    
    return data;
    
  } catch (error) {
    // Si l'erreur est CORS, essayer avec un proxy
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      console.log('Erreur CORS détectée, tentative avec proxy...');
      return await callAPIWithProxy(endpoint);
    }
    throw error;
  }
}

// ----- Fonction avec proxy CORS (AllOrigins) -----
async function callAPIWithProxy(endpoint) {
  const originalUrl = API_BASE_URL + '?endpoint=' + endpoint;
  const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(originalUrl);
  
  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error('Erreur proxy: ' + response.status);
    }
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }
    
    return data;
  } catch (error) {
    throw new Error('Impossible de contacter l\'API: ' + error.message);
  }
}

// ----- Bouton 1 : points par matricule -----
function afficherParMatricule() {
  setActive('btn-matricule');
  document.getElementById('search-row').style.display = 'block';
  showLoading();

  callAPI('matricules')
    .then(function (response) {
      donneesMatricule = response.data;
      renderMatricules(response.data);
    })
    .catch(function (error) {
      showError(error.message);
    });
}

function renderMatricules(data) {
  if (!data || data.length === 0) {
    document.getElementById('panel').innerHTML = '<div class="empty-state">Aucune donnée trouvée dans la feuille.</div>';
    return;
  }

  let rows = data.map(function (r) {
    return '<tr>' +
      '<td>' + r.matricule + '</td>' +
      '<td>' + r.nom + '</td>' +
      '<td>' + r.pole + '</td>' +
      '<td class="pt">' + r.point + '</td>' +
      '</tr>';
  }).join('');

  document.getElementById('panel').innerHTML =
    '<div class="card">' +
      '<h2>Points par matricule</h2>' +
      '<div class="meta">' + data.length + ' collaborateur(s)</div>' +
      '<table id="tbl-matricule">' +
        '<thead><tr><th>Matricule</th><th>Nom et Prénoms</th><th>Pôle</th><th>Point</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' +
    '</div>';
}

function filtrerMatricules() {
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  const filtered = donneesMatricule.filter(function (r) {
    return r.matricule.toLowerCase().includes(q) || r.nom.toLowerCase().includes(q);
  });
  renderMatricules(filtered);
}

// ----- Bouton 2 : total par pôle -----
function afficherParPole() {
  setActive('btn-pole');
  document.getElementById('search-row').style.display = 'none';
  showLoading();

  callAPI('poles')
    .then(function (response) {
      renderPoles(response.data);
    })
    .catch(function (error) {
      showError(error.message);
    });
}

function renderPoles(data) {
  if (!data || data.length === 0) {
    document.getElementById('panel').innerHTML = '<div class="empty-state">Aucune donnée trouvée dans la feuille.</div>';
    return;
  }

  const max = Math.max.apply(null, data.map(function (d) { return d.total; }));
  const medals = ['🥇', '🥈', '🥉'];

  let rows = data.map(function (d, i) {
    const pct = max > 0 ? Math.round((d.total / max) * 100) : 0;
    const medal = medals[i] ? medals[i] : '';
    return '<div class="bar-row">' +
      '<div class="rank-name"><span class="medal">' + medal + '</span>' + d.pole + '</div>' +
      '<div class="bar-track"><div class="bar-fill" data-pct="' + pct + '"></div></div>' +
      '<div class="pt">' + d.total + '</div>' +
      '</div>';
  }).join('');

  document.getElementById('panel').innerHTML =
    '<div class="card">' +
      '<h2>Total des points par pôle</h2>' +
      '<div class="meta">' + data.length + ' pôle(s)</div>' +
      rows +
    '</div>';

  // Anime les barres après insertion dans le DOM
  requestAnimationFrame(function () {
    document.querySelectorAll('.bar-fill').forEach(function (el) {
      el.style.width = el.getAttribute('data-pct') + '%';
    });
  });
}
