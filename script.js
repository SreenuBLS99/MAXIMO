

const ARTIFACTS = [
  { name: 'Maximo Objects',         code: 'MAXOBJECTS',    icon: '🗄️', folder: 'MAXOBJECTS' },
  { name: 'Condition Expressions',  code: 'CONDITIONS',    icon: '📐', folder: 'CONDITIONS' },
  { name: 'Workflows',              code: 'WORKFLOWS',     icon: '🔄', folder: 'WORKFLOWS' },
  { name: 'Automation Scripts',     code: 'AUTOSCRIPTS',   icon: '⚙️', folder: 'AUTOSCRIPTS' },
  { name: 'Escalations',            code: 'ESCALATIONS',   icon: '🚨', folder: 'ESCALATIONS' },
  { name: 'Communication Templates',code: 'COMMTEMPLATES', icon: '📧', folder: 'COMMTEMPLATES' },
  { name: 'Applications',           code: 'APPLICATIONS',  icon: '🧩', folder: 'APPLICATIONS' },
  { name: 'Menus',                  code: 'MENUS',         icon: '📋', folder: 'MENUS' },
  { name: 'Signature Options',      code: 'SIGOPTIONS',    icon: '🔐', folder: 'SIGOPTIONS' },
  { name: 'Relationships',          code: 'RELATIONSHIPS', icon: '🔗', folder: 'RELATIONSHIPS' },
  { name: 'Domains',                code: 'DOMAINS',       icon: '🌐', folder: 'DOMAINS' },
  { name: 'Crossover Tables',       code: 'CROSSOVERS',    icon: '↔️', folder: 'CROSSOVERS' },
  { name: 'Start Centers',          code: 'STARTCENTERS',  icon: '🏠', folder: 'STARTCENTERS' },
  { name: 'Reports',                code: 'REPORTS',       icon: '📊', folder: 'REPORTS' },
  { name: 'KPIs',                   code: 'KPIS',          icon: '📈', folder: 'KPIS' },
];

let state = { selectedArtifact: null, selectedEnv: 'DEV', currentStep: 1 };

function init() {
  const grid = document.getElementById('artifact-grid');
  const extractAllCard = grid.querySelector('.extract-all');
  ARTIFACTS.forEach(a => {
    const card = document.createElement('div');
    card.className = 'artifact-card';
    card.dataset.artifact = a.name;
    card.dataset.code = a.code;
    card.dataset.folder = a.folder;
    card.onclick = () => selectArtifact(card);
    card.innerHTML = `<div class="artifact-icon">${a.icon}</div><div class="artifact-name">${a.name}</div><div class="artifact-code">${a.code}</div><div class="artifact-check"></div>`;
    grid.appendChild(card);
  });
}

function selectArtifact(card) {
  document.querySelectorAll('.artifact-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  state.selectedArtifact = { name: card.dataset.artifact, code: card.dataset.code, folder: card.dataset.folder || card.dataset.code };
  document.getElementById('proceed-btn').disabled = false;
  document.getElementById('selection-hint').textContent = `Selected: ${state.selectedArtifact.name}`;
}

function setStep(n) {
  state.currentStep = n;
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById(`step-${i}`);
    el.classList.remove('active', 'done');
    if (i < n) el.classList.add('done');
    else if (i === n) el.classList.add('active');
  }
}

const screens = ['screen-select','screen-extracting','screen-extract-success','screen-posting','screen-complete','screen-cancelled'];
function showScreen(id) {
  screens.forEach(s => document.getElementById(s).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openExtractModal() {
  if (!state.selectedArtifact) return;
  document.getElementById('modal-artifact-name').textContent = state.selectedArtifact.name;
  openModal('modal-extract');
}

function confirmExtract() {
  closeModal('modal-extract');
  setStep(2);
  showScreen('screen-extracting');
  simulateExtract();
}

function simulateExtract() {
  const labels = [
    'Connecting to Maximo REST API...',
    `Fetching ${state.selectedArtifact.name} objects...`,
    'Cleaning JSON payloads...','Removing unique identifiers...','Writing artifacts to output folder...','Finalizing extraction...',
  ];
  let i = 0;
  const lbl = document.getElementById('extracting-label');
  const interval = setInterval(() => { if (i < labels.length) { lbl.textContent = labels[i++]; } }, 350);
  setTimeout(() => { clearInterval(interval); onExtractComplete(); }, 2400);
}

function onExtractComplete() {
  setStep(3);
  const artifact = state.selectedArtifact;
  const folder = artifact.code === 'ALL' ? 'ALL_MODULES' : artifact.folder;
  document.getElementById('extracted-artifact-name').textContent = artifact.name;
  document.getElementById('output-path').textContent = `./Artifacts/${folder}/`;
  document.getElementById('extract-timestamp').textContent = new Date().toLocaleString();
  showScreen('screen-extract-success');
}

function showExtractSuccess() { setStep(3); showScreen('screen-extract-success'); }

function openPostModal() {
  document.getElementById('modal-post-artifact').textContent = state.selectedArtifact.name;
  document.getElementById('modal-env-display').textContent = state.selectedEnv;
  openModal('modal-post');
}

function selectEnv(chip, env) {
  document.querySelectorAll('.env-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
  state.selectedEnv = env;
  document.getElementById('modal-env-display').textContent = env;
}

function cancelPost() { closeModal('modal-post'); setStep(3); showScreen('screen-cancelled'); }

function confirmPost() {
  closeModal('modal-post');
  setStep(4);
  showScreen('screen-posting');
  simulatePost();
}

function simulatePost() {
  const env = state.selectedEnv;
  const labels = [`Authenticating with ${env} environment...`,'Validating artifact structure...',`Uploading to ${env} via REST API...`,'Applying configuration changes...','Verifying deployment...'];
  let i = 0;
  const lbl = document.getElementById('posting-label');
  const interval = setInterval(() => { if (i < labels.length) { lbl.textContent = labels[i++]; } }, 400);
  setTimeout(() => { clearInterval(interval); onPostComplete(); }, 2400);
}

function onPostComplete() {
  setStep(5);
  document.getElementById('complete-message').textContent = `${state.selectedArtifact.name} was posted to ${state.selectedEnv} successfully.`;
  document.getElementById('complete-summary').textContent = `${state.selectedArtifact.name} → ${state.selectedEnv} · ${new Date().toLocaleTimeString()}`;
  showScreen('screen-complete');
}

function resetFlow() {
  state.selectedArtifact = null;
  state.selectedEnv = 'DEV';
  document.querySelectorAll('.artifact-card').forEach(c => c.classList.remove('selected'));
  const proceedBtn = document.getElementById('proceed-btn');
  if (proceedBtn) proceedBtn.disabled = true;
  const hint = document.getElementById('selection-hint');
  if (hint) hint.textContent = 'No artifact selected';
  document.querySelectorAll('.env-chip').forEach(c => c.classList.remove('selected'));
  const firstEnv = document.querySelector('.env-chip');
  if (firstEnv) firstEnv.classList.add('selected');
  setStep(1);
  showScreen('screen-select');
}

function clearAll() {
  resetFlow();
  localStorage.removeItem('maximoCICDState');
  console.info('Clear All executed: UI state reset and persistent Maximo CICD state removed.');
}

init();
