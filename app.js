const defaultCcnlCatalog = [
  {
    id: 'metalmeccanico-industria',
    name: 'CCNL Metalmeccanico Industria',
    source: 'Catalogo iniziale locale (da aggiornare con feed esterno)',
    updatedAt: '2026-01-15',
    ferieDays: 26,
    rolHours: 72,
    exFestivitaHours: 32,
    tfrRate: 7.41,
    apprenticeshipAgeLimit: 29
  },
  {
    id: 'commercio-terziario',
    name: 'CCNL Commercio e Terziario',
    source: 'Catalogo iniziale locale (da aggiornare con feed esterno)',
    updatedAt: '2025-12-20',
    ferieDays: 26,
    rolHours: 56,
    exFestivitaHours: 32,
    tfrRate: 7.41,
    apprenticeshipAgeLimit: 29
  },
  {
    id: 'studi-professionali',
    name: 'CCNL Studi Professionali',
    source: 'Catalogo iniziale locale (da aggiornare con feed esterno)',
    updatedAt: '2025-11-02',
    ferieDays: 26,
    rolHours: 72,
    exFestivitaHours: 32,
    tfrRate: 7.41,
    apprenticeshipAgeLimit: 29
  }
];

const state = {
  ccnlCatalog: loadStorage('ccnlCatalog', defaultCcnlCatalog),
  profiles: loadStorage('employeeProfiles', []),
  selectedProfileId: null
};

const el = (id) => document.getElementById(id);

function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function euro(value) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
}

function toNumber(id) {
  return Number(el(id).value || 0);
}

function renderCcnl() {
  const select = el('ccnlSelect');
  select.innerHTML = '';
  state.ccnlCatalog.forEach((c) => {
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = c.name;
    select.append(option);
  });
  updateCcnlMeta();
}

function selectedCcnl() {
  return state.ccnlCatalog.find((c) => c.id === el('ccnlSelect').value) || state.ccnlCatalog[0];
}

function updateCcnlMeta() {
  const c = selectedCcnl();
  if (!c) return;
  el('ccnlMeta').innerHTML = `
    <strong>Aggiornamento:</strong> ${c.updatedAt}<br />
    <strong>Ferie:</strong> ${c.ferieDays} giorni · <strong>ROL:</strong> ${c.rolHours}h · <strong>Ex festività:</strong> ${c.exFestivitaHours}h<br />
    <strong>Età max apprendistato:</strong> ${c.apprenticeshipAgeLimit} anni<br />
    <strong>Fonte:</strong> ${c.source}
  `;
}

async function loadRemoteCatalog() {
  const url = el('ccnlUrl').value.trim();
  if (!url) return alert('Inserisci una URL valida.');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Errore nel download del catalogo.');
    const payload = await response.json();
    if (!Array.isArray(payload)) throw new Error('Formato JSON non valido: atteso array.');

    const normalized = payload
      .filter((x) => x.id && x.name)
      .map((x) => ({
        id: x.id,
        name: x.name,
        source: x.source || url,
        updatedAt: x.updatedAt || new Date().toISOString().slice(0, 10),
        ferieDays: Number(x.ferieDays || 26),
        rolHours: Number(x.rolHours || 0),
        exFestivitaHours: Number(x.exFestivitaHours || 0),
        tfrRate: Number(x.tfrRate || 7.41),
        apprenticeshipAgeLimit: Number(x.apprenticeshipAgeLimit || 29)
      }));

    if (!normalized.length) throw new Error('Nessun contratto valido trovato nel feed.');

    state.ccnlCatalog = normalized;
    saveStorage('ccnlCatalog', normalized);
    renderCcnl();
    alert(`Catalogo CCNL aggiornato: ${normalized.length} contratti.`);
  } catch (error) {
    alert(`Impossibile aggiornare il catalogo: ${error.message}`);
  }
}

function collectForm() {
  return {
    id: state.selectedProfileId || crypto.randomUUID(),
    employeeName: el('employeeName').value.trim() || 'Dipendente tipo',
    employeeAge: toNumber('employeeAge'),
    level: el('level').value.trim(),
    grossMonthly: toNumber('grossMonthly'),
    superminimum: toNumber('superminimum'),
    overtime: toNumber('overtime'),
    travel: toNumber('travel'),
    annualBonus: toNumber('annualBonus'),
    hoursPerDay: toNumber('hoursPerDay'),
    workingDaysYear: toNumber('workingDaysYear'),
    employerContrib: toNumber('employerContrib'),
    insuranceRate: toNumber('insuranceRate'),
    sickRate: toNumber('sickRate'),
    extraMonths: toNumber('extraMonths'),
    projectDays: toNumber('projectDays'),
    projectExtraHours: toNumber('projectExtraHours'),
    ccnlId: el('ccnlSelect').value
  };
}

function fillForm(profile) {
  Object.entries(profile).forEach(([k, v]) => {
    const node = el(k);
    if (!node) return;
    node.value = v;
  });
  if (profile.ccnlId) el('ccnlSelect').value = profile.ccnlId;
  state.selectedProfileId = profile.id;
  updateCcnlMeta();
}

function refreshProfilesSelect() {
  const select = el('savedProfiles');
  select.innerHTML = '<option value="">-- Seleziona profilo --</option>';
  state.profiles.forEach((p) => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = `${p.employeeName} (${p.level || 'n/d'})`;
    select.append(option);
  });
  if (state.selectedProfileId) select.value = state.selectedProfileId;
}

function saveProfile() {
  const profile = collectForm();
  const index = state.profiles.findIndex((p) => p.id === profile.id);
  if (index >= 0) state.profiles[index] = profile;
  else state.profiles.push(profile);

  state.selectedProfileId = profile.id;
  saveStorage('employeeProfiles', state.profiles);
  refreshProfilesSelect();
  alert('Profilo salvato con successo.');
}

function resetProfile() {
  state.selectedProfileId = null;
  el('employeeName').value = '';
  el('level').value = '';
  el('savedProfiles').value = '';
}

function calculate() {
  const data = collectForm();
  const ccnl = selectedCcnl();

  const monthlyGross = data.grossMonthly + data.superminimum + data.overtime + data.travel;
  const annualGrossWithMonths = monthlyGross * (12 + data.extraMonths);
  const annualGross = annualGrossWithMonths + data.annualBonus;

  const contribCost = annualGross * (data.employerContrib / 100);
  const insuranceCost = annualGross * (data.insuranceRate / 100);
  const tfrCost = annualGross * (ccnl.tfrRate / 100);

  const hoursYearBase = data.workingDaysYear * data.hoursPerDay;
  const ferieHours = ccnl.ferieDays * data.hoursPerDay;
  const permitsHours = ccnl.rolHours + ccnl.exFestivitaHours;
  const sickHours = hoursYearBase * (data.sickRate / 100);

  const productiveHours = Math.max(1, hoursYearBase - ferieHours - permitsHours - sickHours);
  const absenceCost = (annualGross / Math.max(1, hoursYearBase)) * (ferieHours + permitsHours + sickHours);

  const totalAnnualCost = annualGross + contribCost + insuranceCost + tfrCost + absenceCost;
  const effectiveHourlyCost = totalAnnualCost / productiveHours;
  const effectiveDailyCost = effectiveHourlyCost * data.hoursPerDay;

  const projectHours = data.projectDays * data.hoursPerDay + data.projectExtraHours;
  const projectCost = projectHours * effectiveHourlyCost;

  const ageNote = data.employeeAge <= ccnl.apprenticeshipAgeLimit
    ? 'Età compatibile con soglia apprendistato CCNL.'
    : 'Età oltre soglia apprendistato CCNL.';

  const results = [
    ['Costo annuo totale aziendale', euro(totalAnnualCost)],
    ['Ore produttive annue stimate', `${productiveHours.toFixed(1)} h`],
    ['Costo orario effettivo', euro(effectiveHourlyCost)],
    ['Costo giornaliero effettivo', euro(effectiveDailyCost)],
    ['Costo progetto simulato', euro(projectCost)],
    ['Incidenza ferie+permessi+malattia', euro(absenceCost)],
    ['Contributi e oneri annui', euro(contribCost + insuranceCost + tfrCost)],
    ['Nota età / apprendistato', ageNote]
  ];

  el('resultGrid').innerHTML = results
    .map(([title, value]) => `<div class="kpi"><span>${title}</span><strong>${value}</strong></div>`)
    .join('');
}

function bootstrap() {
  renderCcnl();
  refreshProfilesSelect();
  el('ccnlSelect').addEventListener('change', updateCcnlMeta);
  el('loadRemoteCcnl').addEventListener('click', loadRemoteCatalog);
  el('saveProfile').addEventListener('click', saveProfile);
  el('newProfile').addEventListener('click', resetProfile);
  el('calculate').addEventListener('click', calculate);

  el('savedProfiles').addEventListener('change', (e) => {
    const profile = state.profiles.find((p) => p.id === e.target.value);
    if (profile) fillForm(profile);
  });

  calculate();
}

bootstrap();
