// ================================================================
// CONFIGURATION API
// ================================================================
// Remplacez par l'URL de votre Web App déployée
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzXT-GTatAz75ISQKVekud3mZkTTR_L38paF2d0RHqaauZcYa9Yzi7vQLl5EIh6Ntgp9A/exec';

// ================================================================
// SOLUTION 1: Utiliser un proxy CORS (Recommandé)
// ================================================================
// Décommentez cette ligne et commentez la ligne ci-dessus pour utiliser le proxy
// const API_BASE_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://script.google.com/macros/s/AKfycbwGCyRDLbFNt0Ee6jrdkUwaPNXgK4gfBHy2hpy4gIF89UT1i7MD356yBRpHIh5aImL2xA/exec');

// ================================================================
// SOLUTION 2: Utiliser le mode no-cors (ne fonctionne pas pour les données JSON)
// ================================================================
// Cette solution ne fonctionne pas car elle bloque la lecture des données

// ================================================================
// SOLUTION 3: Héberger le frontend sur Google Apps Script
// ================================================================
// Utilisez doGet() dans code.gs pour servir le HTML directement

// ================================================================
// Papillons animés en fond
// ================================================================
function creerPapillon() {
  const layer = document.getElementById('butterfly-layer');
  const b = document.createElement('div');
  b.className = 'butterfly';

  const palettes = [
    { main: '#0ABAB5', dark: '#086E6A', spot: '#E9FBF9' },
    { main: '#D8B34C', dark: '#9A7A26', spot: '#FFF6DE' },
    { main: '#E8846B', dark: '#B85238', spot: '#FFEDE6' }
  ];
  const p = palettes[Math.floor(Math.random() * palettes.length)];

  const left = Math.random() * 96 + 1;
  const flyDuration = 9 + Math.random() * 10;
  const driftDuration = 3 + Math.random() * 3;
  const delay = Math.random() * 6;
  const scale = 0.7 + Math.random() * 1.0;

  b.style.left = left + 'vw';
  b.style.animationDuration = flyDuration + 's, ' + driftDuration + 's';
  b.style.animationDelay = '-' + delay + 's, -' + (delay * 0.5) + 's';
  b.style.transform = 'scale(' + scale + ')';

  b.innerHTML =
    '<svg viewBox="0 0 60 50">' +
      '<defs>' +
        '<radialGradient id="grad-' + p.main.slice(1) + '" cx="35%" cy="35%" r="75%">' +
          '<stop offset="0%" stop-color="' + p.spot + '"/>' +
          '<stop offset="55%" stop-color="' + p.main + '"/>' +
          '<stop offset="100%" stop-color="' + p.dark + '"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<g class="wing left">' +
        '<path d="M30 26 C 20 34, 8 36, 6 27 C 4 20, 12 16, 22 22 Z" ' +
              'fill="url(#grad-' + p.main.slice(1) + ')" stroke="' + p.dark + '" stroke-width="0.6"/>' +
        '<path d="M30 26 C 20 34, 8 36, 6 27 C 4 20, 12 16, 22 22 Z" fill="none" ' +
              'stroke="' + p.dark + '" stroke-width="0.4" stroke-opacity="0.5"/>' +
        '<path d="M30 24 C 18 18, 4 12, 2 4 C 0 -2, 10 -1, 18 6 C 25 12, 29 18, 30 24 Z" ' +
              'fill="url(#grad-' + p.main.slice(1) + ')" stroke="' + p.dark + '" stroke-width="0.6"/>' +
        '<circle cx="12" cy="9" r="1.6" fill="' + p.spot + '" opacity="0.9"/>' +
        '<circle cx="9" cy="26" r="1.3" fill="' + p.spot + '" opacity="0.85"/>' +
      '</g>' +
      '<g class="wing right">' +
        '<path d="M30 26 C 40 34, 52 36, 54 27 C 56 20, 48 16, 38 22 Z" ' +
              'fill="url(#grad-' + p.main.slice(1) + ')" stroke="' + p.dark + '" stroke-width="0.6"/>' +
        '<path d="M30 26 C 40 34, 52 36, 54 27 C 56 20, 48 16, 38 22 Z" fill="none" ' +
              'stroke="' + p.dark + '" stroke-width="0.4" stroke-opacity="0.5"/>' +
        '<path d="M30 24 C 42 18, 56 12, 58 4 C 60 -2, 50 -1, 42 6 C 35 12, 31 18, 30 24 Z" ' +
              'fill="url(#grad-' + p.main.slice(1) + ')" stroke="' + p.dark + '" stroke-width="0.6"/>' +
        '<circle cx="48" cy="9" r="1.6" fill="' + p.spot + '" opacity="0.9"/>' +
        '<circle cx="51" cy="26" r="1.3" fill="' + p.spot + '" opacity="0.85"/>' +
      '</g>' +
      '<ellipse cx="30" cy="16" rx="1.7" ry="4" fill="' + p.dark + '"/>' +
      '<ellipse cx="30" cy="23" rx="1.5" ry="4.5" fill="' + p.dark + '"/>' +
      '<ellipse cx="30" cy="30" rx="1.3" ry="4" fill="' + p.dark + '"/>' +
      '<path d="M30 13 C 28 9, 25 6, 22 5" fill="none" stroke="' + p.dark + '" stroke-width="0.7" stroke-linecap="round"/>' +
      '<path d="M30 13 C 32 9, 35 6, 38 5" fill="none" stroke="' + p.dark + '" stroke-width="0.7" stroke-linecap="round"/>' +
      '<circle cx="22" cy="5" r="0.9" fill="' + p.dark + '"/>' +
      '<circle cx="38" cy="5" r="0.9" fill="' + p.dark + '"/>' +
    '</svg>';

  layer.appendChild(b);
}

function lancerVolee(nombre) {
  for (let i = 0; i < nombre; i++) {
    setTimeout(creerPapillon, i * 350);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  lancerVolee(9);
  setInterval(function () {
    const layer = document.getElementById('butterfly-layer');
    if (layer.children.length < 12) creerPapillon();
    if (layer.children.length > 16) layer.removeChild(layer.firstChild);
  }, 4000);
});

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
