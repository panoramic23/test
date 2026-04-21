const state = {
  users: [
    { id: 1, name: 'Giulia Rinaldi', email: 'giulia.rinaldi@pha-se.it', role: 'Project Manager', master: true },
    { id: 2, name: 'Marco Bianchi', email: 'marco.bianchi@pha-se.it', role: 'Validation Engineer', master: false },
    { id: 3, name: 'Sara Conti', email: 'sara.conti@pha-se.it', role: 'Consultant', master: false }
  ],
  clients: [
    {
      id: crypto.randomUUID(),
      company: 'Farmaceutica Alfa S.p.A.',
      contact: 'Luca Ferri',
      contactEmail: 'luca.ferri@alfa.it',
      services: 'Convalida impianto sterile, IQ/OQ/PQ e audit qualità',
      status: 'in_corso',
      deadline: '2026-06-30',
      documents: 'Piano di convalida, report SAT, check list deviazioni',
      milestones: ['Kickoff completato', 'IQ al 75%', 'Formazione team QA in agenda'],
      assignees: [1, 2],
      calendar: ['2026-04-24: FAT review', '2026-05-02: On-site commissioning'],
      alert: 'Richiesta firma protocollo OQ entro venerdì'
    },
    {
      id: crypto.randomUUID(),
      company: 'BioMed Labs',
      contact: 'Elena Marini',
      contactEmail: 'procurement@biomedlabs.com',
      services: 'Supporto cGMP e miglioramento documentazione batch record',
      status: 'in_attesa',
      deadline: '2026-05-20',
      documents: 'Gap analysis e action plan',
      milestones: ['Assessment iniziale completato', 'In attesa feedback cliente'],
      assignees: [1, 3],
      calendar: ['2026-04-28: Review KPI processo'],
      alert: 'Mancano allegati per audit FDA'
    }
  ],
  currentEmployee: null,
  currentClientEmail: null
};

const views = {
  employeeAuth: document.querySelector('#employee-auth'),
  clientAuth: document.querySelector('#client-auth'),
  employeeDashboard: document.querySelector('#employee-dashboard'),
  clientDashboard: document.querySelector('#client-dashboard'),
  summaryCards: document.querySelector('#summary-cards'),
  calendarList: document.querySelector('#calendar-list'),
  alertsList: document.querySelector('#alerts-list'),
  clientCards: document.querySelector('#client-cards'),
  statusFilter: document.querySelector('#status-filter'),
  masterPanel: document.querySelector('#master-panel'),
  assignEmployee: document.querySelector('#assign-employee'),
  assignClient: document.querySelector('#assign-client'),
  clientView: document.querySelector('#client-view')
};

const labels = {
  in_corso: 'In corso',
  in_attesa: 'In attesa',
  da_avviare: 'Da avviare',
  concluso: 'Concluso'
};

document.querySelectorAll('[data-nav]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.nav;
    views.employeeAuth.classList.toggle('hidden', target !== 'employee');
    views.clientAuth.classList.toggle('hidden', target !== 'client');
  });
});

document.querySelector('#employee-login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.querySelector('#employee-email').value.trim().toLowerCase();
  const masterFlag = document.querySelector('#employee-master').checked;
  const employee = state.users.find((u) => u.email === email);

  if (!employee) {
    alert('Utente non trovato. Usa una mail aziendale valida.');
    return;
  }

  state.currentEmployee = { ...employee, master: masterFlag || employee.master };
  views.employeeAuth.classList.add('hidden');
  views.clientAuth.classList.add('hidden');
  views.employeeDashboard.classList.remove('hidden');
  renderEmployeeDashboard();
});

document.querySelector('#client-login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.querySelector('#client-email').value.trim().toLowerCase();
  state.currentClientEmail = email;
  views.employeeAuth.classList.add('hidden');
  views.clientAuth.classList.add('hidden');
  views.clientDashboard.classList.remove('hidden');
  renderClientView();
});

document.querySelector('#logout-employee').addEventListener('click', () => {
  state.currentEmployee = null;
  views.employeeDashboard.classList.add('hidden');
  views.employeeAuth.classList.remove('hidden');
});

document.querySelector('#logout-client').addEventListener('click', () => {
  state.currentClientEmail = null;
  views.clientDashboard.classList.add('hidden');
  views.clientAuth.classList.remove('hidden');
});

document.querySelector('#status-filter').addEventListener('change', renderEmployeeDashboard);

document.querySelector('#new-client-btn').addEventListener('click', () => {
  document.querySelector('#client-modal').showModal();
});

document.querySelector('#cancel-client').addEventListener('click', () => {
  document.querySelector('#client-modal').close();
});

document.querySelector('#new-client-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!state.currentEmployee) return;

  const client = {
    id: crypto.randomUUID(),
    company: document.querySelector('#client-name').value,
    contact: document.querySelector('#client-contact').value,
    contactEmail: document.querySelector('#client-contact-email').value.toLowerCase(),
    status: document.querySelector('#client-status').value,
    services: document.querySelector('#client-services').value,
    deadline: document.querySelector('#client-deadline').value,
    documents: document.querySelector('#client-docs').value,
    milestones: ['Scheda creata', 'Raccolta documenti iniziale'],
    assignees: [state.currentEmployee.id],
    calendar: [`${document.querySelector('#client-deadline').value}: scadenza principale`],
    alert: 'Verificare se servono materiali aggiuntivi dal cliente'
  };

  state.clients.unshift(client);
  document.querySelector('#client-modal').close();
  document.querySelector('#new-client-form').reset();
  renderEmployeeDashboard();
});

document.querySelector('#new-employee-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.querySelector('#new-employee-name').value;
  const email = document.querySelector('#new-employee-email').value.toLowerCase();
  const role = document.querySelector('#new-employee-role').value;
  const nextId = Math.max(...state.users.map((u) => u.id)) + 1;

  state.users.push({ id: nextId, name, email, role, master: false });
  e.target.reset();
  renderMasterControls();
  alert('Dipendente creato con successo.');
});

document.querySelector('#assign-project-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const employeeId = Number(views.assignEmployee.value);
  const clientId = views.assignClient.value;
  const client = state.clients.find((c) => c.id === clientId);
  if (!client || client.assignees.includes(employeeId)) return;
  client.assignees.push(employeeId);
  renderEmployeeDashboard();
});

function renderEmployeeDashboard() {
  if (!state.currentEmployee) return;
  const mine = state.clients.filter((c) => c.assignees.includes(state.currentEmployee.id));
  const filter = views.statusFilter.value;
  const visible = filter === 'all' ? mine : mine.filter((c) => c.status === filter);

  const inCorso = mine.filter((c) => c.status === 'in_corso').length;
  const inAttesa = mine.filter((c) => c.status === 'in_attesa').length;
  const conclusi = mine.filter((c) => c.status === 'concluso').length;

  views.summaryCards.innerHTML = `
    <div class="summary-box"><strong>${mine.length}</strong><span>Clienti assegnati</span></div>
    <div class="summary-box"><strong>${inCorso}</strong><span>Progetti in corso</span></div>
    <div class="summary-box"><strong>${inAttesa}</strong><span>In attesa</span></div>
    <div class="summary-box"><strong>${conclusi}</strong><span>Conclusi</span></div>
  `;

  views.calendarList.innerHTML = mine
    .flatMap((c) => c.calendar.map((e) => `<li><strong>${c.company}</strong> — ${e}</li>`))
    .join('') || '<li>Nessun evento programmato.</li>';

  views.alertsList.innerHTML = mine
    .map((c) => `<li><strong>${c.company}</strong>: ${c.alert}</li>`)
    .join('') || '<li>Nessun alert attivo.</li>';

  views.clientCards.innerHTML = visible
    .map((c) => {
      const staff = c.assignees
        .map((id) => state.users.find((u) => u.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      return `
        <article class="client-card">
          <h4>${c.company}</h4>
          <p class="client-meta"><strong>Referente:</strong> ${c.contact} (${c.contactEmail})</p>
          <p class="client-meta"><strong>Servizi:</strong> ${c.services}</p>
          <p class="client-meta"><strong>Scadenza:</strong> ${fmtDate(c.deadline)}</p>
          <p class="client-meta"><strong>Team:</strong> ${staff}</p>
          <p class="client-meta"><strong>Documenti:</strong> ${c.documents || 'Nessuno'}</p>
          <p class="client-meta"><strong>Milestones:</strong> ${c.milestones.join(' • ')}</p>
          <button class="btn" onclick="updateStatus('${c.id}')">Cambia stato</button>
          <span class="status-chip status-${c.status}">${labels[c.status]}</span>
        </article>
      `;
    })
    .join('') || '<p>Nessuna scheda cliente per questo filtro.</p>';

  views.masterPanel.classList.toggle('hidden', !state.currentEmployee.master);
  if (state.currentEmployee.master) renderMasterControls();
}

function renderMasterControls() {
  views.assignEmployee.innerHTML = state.users
    .map((u) => `<option value="${u.id}">${u.name} (${u.role})</option>`)
    .join('');
  views.assignClient.innerHTML = state.clients
    .map((c) => `<option value="${c.id}">${c.company}</option>`)
    .join('');
}

function renderClientView() {
  const project = state.clients.find((c) => c.contactEmail.toLowerCase() === state.currentClientEmail);
  if (!project) {
    views.clientView.innerHTML = '<h3>Nessuna scheda trovata</h3><p>Contatta il tuo referente PHA.SE. per abilitare l’accesso.</p>';
    return;
  }

  const lead = state.users.find((u) => u.id === project.assignees[0]);
  views.clientView.innerHTML = `
    <h3>${project.company}</h3>
    <p><strong>Stato attività:</strong> <span class="status-chip status-${project.status}">${labels[project.status]}</span></p>
    <p><strong>Servizi in corso:</strong> ${project.services}</p>
    <p><strong>Scadenza principale:</strong> ${fmtDate(project.deadline)}</p>
    <p><strong>Documenti condivisi:</strong> ${project.documents}</p>
    <p><strong>Step principali:</strong> ${project.milestones.join(' • ')}</p>
    <p><strong>Prossime attività:</strong></p>
    <ul>${project.calendar.map((e) => `<li>${e}</li>`).join('')}</ul>
    <hr>
    <p><strong>Referente PHA.SE.:</strong> ${lead?.name || 'N/D'} (${lead?.email || 'N/D'})</p>
    <p><strong>Canali utili:</strong> Upload documenti, richieste materiali, ticket dedicato e note meeting.</p>
  `;
}

window.updateStatus = (clientId) => {
  const client = state.clients.find((c) => c.id === clientId);
  if (!client) return;
  const flow = ['da_avviare', 'in_corso', 'in_attesa', 'concluso'];
  const idx = flow.indexOf(client.status);
  client.status = flow[(idx + 1) % flow.length];
  renderEmployeeDashboard();
};

function fmtDate(iso) {
  if (!iso) return 'N/D';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('it-IT');
}
