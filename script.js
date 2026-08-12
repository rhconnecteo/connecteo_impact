// ================================================================
// CONFIGURATION API
// ================================================================
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzQJP-OnekVVvr23-UM8vUNReuHOQ9cTsLPauW5dVF1f0puOi48cjz-ZHv1_NtxgCeu0g/exec';

// ================================================================
// État
// ================================================================
let donneesMatricule = [];
let pageActuelle = 1;
const ITEMS_PAR_PAGE = 10;

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

// ----- Fonction générique pour appeler l'API -----
async function callAPI(endpoint) {
  const url = API_BASE_URL + '?endpoint=' + endpoint;
  
  try {
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
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      return await callAPIWithProxy(endpoint);
    }
    throw error;
  }
}

// ----- Fonction avec proxy CORS -----
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
  pageActuelle = 1;

  callAPI('matricules')
    .then(function (response) {
      donneesMatricule = response.data;
      afficherPage(1);
    })
    .catch(function (error) {
      showError(error.message);
    });
}

// ----- Fonction pour afficher une page spécifique -----
function afficherPage(page) {
  const totalItems = donneesMatricule.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PAR_PAGE);
  
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  
  pageActuelle = page;
  
  const start = (page - 1) * ITEMS_PAR_PAGE;
  const end = Math.min(start + ITEMS_PAR_PAGE, totalItems);
  const pageData = donneesMatricule.slice(start, end);
  
  renderMatricules(pageData, page, totalPages, totalItems);
}

// ----- Rendu des matricules avec pagination -----
function renderMatricules(data, page, totalPages, totalItems) {
  if (!data || data.length === 0) {
    document.getElementById('panel').innerHTML = '<div class="empty-state">Aucune donnée trouvée dans la feuille.</div>';
    return;
  }

  // Médailles pour les 3 premiers (basé sur le classement global)
  const medals = ['🥇', '🥈', '🥉'];
  
  let rows = data.map(function (r, index) {
    const globalIndex = (page - 1) * ITEMS_PAR_PAGE + index;
    const medal = globalIndex < 3 ? medals[globalIndex] : '';
    const medalClass = globalIndex === 0 ? 'gold' : globalIndex === 1 ? 'silver' : globalIndex === 2 ? 'bronze' : '';
    return '<tr class="' + medalClass + '">' +
      '<td class="medal-col">' + (medal ? '<span class="medal-icon">' + medal + '</span>' : '') + '</td>' +
      '<td>' + r.matricule + '</td>' +
      '<td>' + r.nom + '</td>' +
      '<td>' + r.pole + '</td>' +
      '<td class="pt">' + r.point + '</td>' +
      '</tr>';
  }).join('');

  // Générer les boutons de pagination
  let paginationHtml = '';
  if (totalPages > 1) {
    paginationHtml = '<div class="pagination">';
    
    paginationHtml += '<span class="page-info">Page ' + page + ' / ' + totalPages + '</span>';
    
    paginationHtml += '<button class="page-btn prev" onclick="changerPage(' + (page - 1) + ')" ' + (page <= 1 ? 'disabled' : '') + '>◀ Précédent</button>';
    
    let debutPage = Math.max(1, page - 2);
    let finPage = Math.min(totalPages, page + 2);
    
    if (debutPage > 1) {
      paginationHtml += '<button class="page-btn" onclick="changerPage(1)">1</button>';
      if (debutPage > 2) paginationHtml += '<span class="page-dots">…</span>';
    }
    
    for (let i = debutPage; i <= finPage; i++) {
      paginationHtml += '<button class="page-btn ' + (i === page ? 'active' : '') + '" onclick="changerPage(' + i + ')">' + i + '</button>';
    }
    
    if (finPage < totalPages) {
      if (finPage < totalPages - 1) paginationHtml += '<span class="page-dots">…</span>';
      paginationHtml += '<button class="page-btn" onclick="changerPage(' + totalPages + ')">' + totalPages + '</button>';
    }
    
    paginationHtml += '<button class="page-btn next" onclick="changerPage(' + (page + 1) + ')" ' + (page >= totalPages ? 'disabled' : '') + '>Suivant ▶</button>';
    
    paginationHtml += '</div>';
  }

  document.getElementById('panel').innerHTML =
    '<div class="card">' +
      '<div class="card-header">' +
        '<h2>🏆 Classement des points</h2>' +
        '<div class="meta">' + totalItems + ' collaborateur(s) — Trié par points décroissant</div>' +
      '</div>' +
      '<div style="max-height:500px;overflow-y:auto;">' +
        '<table id="tbl-matricule">' +
          '<thead><tr><th></th><th>Matricule</th><th>Nom et Prénoms</th><th>Pôle</th><th>Points</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>' +
      paginationHtml +
    '</div>';
}

// ----- Changer de page -----
function changerPage(page) {
  const totalItems = donneesMatricule.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PAR_PAGE);
  
  if (page < 1 || page > totalPages) return;
  
  afficherPage(page);
  
  const panel = document.getElementById('panel');
  if (panel) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ----- Filtrer les matricules (recherche) -----
function filtrerMatricules() {
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  
  if (q === '') {
    pageActuelle = 1;
    afficherPage(1);
  } else {
    const filtered = donneesMatricule.filter(function (r) {
      return r.matricule.toLowerCase().includes(q) || r.nom.toLowerCase().includes(q);
    });
    
    if (filtered.length === 0) {
      document.getElementById('panel').innerHTML = '<div class="empty-state">Aucun collaborateur trouvé.</div>';
      return;
    }
    
    const medals = ['🥇', '🥈', '🥉'];
    let rows = filtered.map(function (r, index) {
      const medal = index < 3 ? medals[index] : '';
      const medalClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
      return '<tr class="' + medalClass + '">' +
        '<td class="medal-col">' + (medal ? '<span class="medal-icon">' + medal + '</span>' : '') + '</td>' +
        '<td>' + r.matricule + '</td>' +
        '<td>' + r.nom + '</td>' +
        '<td>' + r.pole + '</td>' +
        '<td class="pt">' + r.point + '</td>' +
        '</tr>';
    }).join('');
    
    document.getElementById('panel').innerHTML =
      '<div class="card">' +
        '<div class="card-header">' +
          '<h2>🔍 Résultats de recherche</h2>' +
          '<div class="meta">' + filtered.length + ' collaborateur(s) trouvé(s)</div>' +
        '</div>' +
        '<div style="max-height:500px;overflow-y:auto;">' +
          '<table id="tbl-matricule">' +
            '<thead><tr><th></th><th>Matricule</th><th>Nom et Prénoms</th><th>Pôle</th><th>Points</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }
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
    const medalClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    return '<div class="bar-row ' + medalClass + '">' +
      '<div class="rank-name"><span class="medal">' + medal + '</span>' + d.pole + '</div>' +
      '<div class="bar-track"><div class="bar-fill" data-pct="' + pct + '"></div></div>' +
      '<div class="pt">' + d.total + '</div>' +
      '</div>';
  }).join('');

  document.getElementById('panel').innerHTML =
    '<div class="card">' +
      '<div class="card-header">' +
        '<h2>📊 Total des points par pôle</h2>' +
        '<div class="meta">' + data.length + ' pôle(s) — Trié par points décroissant</div>' +
      '</div>' +
      rows +
    '</div>';

  requestAnimationFrame(function () {
    document.querySelectorAll('.bar-fill').forEach(function (el) {
      el.style.width = el.getAttribute('data-pct') + '%';
    });
  });
}

// Rendre les fonctions globales
window.afficherParMatricule = afficherParMatricule;
window.afficherParPole = afficherParPole;
window.filtrerMatricules = filtrerMatricules;
window.changerPage = changerPage;
