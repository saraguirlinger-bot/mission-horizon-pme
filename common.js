/* ═══════════════════════════════════════
   TECHNIBOIS — JS commun
   ═══════════════════════════════════════ */

// ── Constantes générales ──
const SCORE_MAX = 80;
const STEP_MAX  = { 1:16, 2:8, 3:8, 4:12, 5:8, 6:12, 7:16, 8:10 };
const STEP_NAMES = {
  1: 'Classification des charges',
  2: 'Unités d\'œuvre',
  3: 'Calcul des taux UO',
  4: 'Coût complet',
  5: 'Méthode ABC',
  6: 'Décision sur commande',
  7: 'Crédit-bail & Seuil',
  8: 'Décision de pilotage'
};

// ── Profils apprenants ──
const PROFILES = [
  {
    id: 'consolider',
    label: '📐 À consolider',
    min: 0, max: 39,
    desc: 'Les fondamentaux du pilotage par les coûts sont encore en construction.',
    strengths: 'Vous avez abordé l\'ensemble des concepts.',
    improve: 'Revoir la distinction charges directes/indirectes et la logique de répartition des charges indirectes.',
    conseil: 'Commencez par maîtriser la classification des charges avant d\'attaquer les calculs de coûts.',
    next: 'Relire le mémo données et refaire l\'étape 1 et 2.'
  },
  {
    id: 'analyste',
    label: '📊 Analyste en progression',
    min: 40, max: 59,
    desc: 'Vous comprenez la logique générale mais des erreurs de méthode subsistent.',
    strengths: 'Bonne intuition sur la classification et les unités d\'œuvre.',
    improve: 'Consolider les calculs d\'imputation et la comparaison coût/décision.',
    conseil: 'Relisez les corrections des étapes 3, 4 et 6 pour ancrer la méthode.',
    next: 'Refaire les étapes de calcul (3 et 4) à partir des données du mémo.'
  },
  {
    id: 'technicien',
    label: '🔩 Technicien des calculs',
    min: 60, max: 74,
    desc: 'Vos calculs sont solides mais l\'interprétation et la décision finale peuvent progresser.',
    strengths: 'Très bonne maîtrise des calculs numériques (UO, coût complet, HS).',
    improve: 'Travailler l\'analyse décisionnelle : seuil de bascule, arbitrage HS/crédit-bail.',
    conseil: 'Les chiffres sont là — maintenant il faut les transformer en décision argumentée.',
    next: 'Refaire les étapes 7 et 8 en vous concentrant sur le raisonnement.'
  },
  {
    id: 'pilote',
    label: '🏭 Pilote de gestion',
    min: 75, max: 89,
    desc: 'Vous maîtrisez les fondamentaux et prenez des décisions cohérentes.',
    strengths: 'Bon équilibre calcul / interprétation / décision.',
    improve: 'Quelques points à affiner sur la méthode ABC ou le seuil d\'indifférence.',
    conseil: 'Approfondissez la méthode ABC pour aller vers un pilotage par activités.',
    next: 'Découvrir le pilotage par tableaux de bord et indicateurs de performance.'
  },
  {
    id: 'stratege',
    label: '🎯 Stratège PME',
    min: 90, max: 100,
    desc: 'Excellent résultat — vous pilotez par les coûts avec aisance et précision.',
    strengths: 'Maîtrise complète : calculs, méthode, décision, arbitrage stratégique.',
    improve: 'Perfectionner la communication des résultats au dirigeant.',
    conseil: 'Vous êtes prêt pour des situations de pilotage complexes (multi-produits, ABC avancé).',
    next: 'Exercices de contrôle de gestion avancés : budget flexible, écarts, reporting.'
  }
];

// ── Helpers ──
function getProfile(pct) {
  return PROFILES.find(p => pct >= p.min && pct <= p.max) || PROFILES[0];
}

function loadState() {
  try { return JSON.parse(localStorage.getItem('technibois_state') || '{}'); }
  catch(e) { return {}; }
}

function saveState(key, value) {
  const s = loadState();
  s[key] = value;
  localStorage.setItem('technibois_state', JSON.stringify(s));
}

function getScore(step) {
  const s = loadState();
  return s['score_' + step] || 0;
}

function setScore(step, pts) {
  saveState('score_' + step, pts);
  updateProgress();
}

function getTotalScore() {
  let total = 0;
  for(let i=1; i<=8; i++) total += getScore(i);
  return total;
}

function updateProgress() {
  const fill  = document.getElementById('progress-fill');
  const label = document.getElementById('progress-pts');
  if (!fill || !label) return;
  const tot = getTotalScore();
  fill.style.width = (tot / SCORE_MAX * 100) + '%';
  label.textContent = tot + ' / ' + SCORE_MAX + ' pts';
}

// ── Identity ──
function saveIdentity() {
  const nEl = document.getElementById('f-nom');
  const pEl = document.getElementById('f-prenom');
  const gEl = document.getElementById('f-groupe');
  // Ne sauvegarder que si les champs existent sur la page
  if (!nEl && !pEl && !gEl) return;
  // Récupérer les valeurs existantes pour ne pas écraser avec du vide
  const existing = loadState().identity || {};
  const nom    = nEl?.value.trim() || existing.nom    || '';
  const prenom = pEl?.value.trim() || existing.prenom || '';
  const groupe = gEl?.value.trim() || existing.groupe || '';
  saveState('identity', { nom, prenom, groupe });
}

function loadIdentity() {
  const s = loadState();
  const id = s.identity || {};
  const n = document.getElementById('f-nom');
  const p = document.getElementById('f-prenom');
  const g = document.getElementById('f-groupe');
  if (n && id.nom)    n.value = id.nom;
  if (p && id.prenom) p.value = id.prenom;
  if (g && id.groupe) g.value = id.groupe;
}

// ── Feedback helpers ──
function fbInline(id, ok, expected) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = ok
    ? '<span class="fb-ok">✓ Correct</span>'
    : '<span class="fb-ko">✗ Attendu : ' + expected + '</span>';
}

function markChoices(groupId, correctValues) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.choice').forEach(c => {
    const inp = c.querySelector('input');
    if (!inp) return;
    c.classList.remove('correct', 'wrong');
    if (correctValues.includes(inp.value)) {
      c.classList.add('correct');
    } else if (inp.checked) {
      c.classList.add('wrong');
    }
  });
}

function showFeedback(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('show');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ── Navigation ──
function scrollToStep(stepBodyId) {
  const el = document.getElementById(stepBodyId);
  if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
}

// ── Choices binding ──
function bindChoices() {
  document.querySelectorAll('.choice').forEach(item => {
    item.addEventListener('click', () => {
      const inp = item.querySelector('input');
      if (!inp) return;
      if (inp.type === 'radio') {
        document.querySelectorAll('input[name="' + inp.name + '"]')
          .forEach(r => r.closest('.choice').classList.remove('selected'));
        inp.checked = true;
        item.classList.add('selected');
      } else {
        inp.checked = !inp.checked;
        item.classList.toggle('selected', inp.checked);
      }
    });
  });
}

// ── Date auto ──
function setDate() {
  const el = document.getElementById('f-date');
  if (el) el.value = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

// ── Init commun ──
window.addEventListener('DOMContentLoaded', () => {
  setDate();
  bindChoices();
  loadIdentity();
  updateProgress();
  // Save identity on blur
  ['f-nom','f-prenom','f-groupe'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', saveIdentity);
  });
});
