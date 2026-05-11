// Admin client script moved out of Astro page to avoid build transform issues
(function(){
  // Elements
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const adminArea = document.getElementById('admin-area');
  const passInput = document.getElementById('admin-pass');
  const tbody = document.querySelector('#guests-table tbody');
  const statTotal = document.getElementById('stat-total');
  const statConfirmed = document.getElementById('stat-confirmed');
  const statCheckin = document.getElementById('stat-checkin');
  const filterInput = document.getElementById('filter-input');
  const exportBtn = document.getElementById('export-btn');
  const refreshBtn = document.getElementById('refresh-btn');

  const modal = document.getElementById('edit-modal');
  const modalName = document.getElementById('modal-name');
  const modalEmail = document.getElementById('modal-email');
  const modalPhone = document.getElementById('modal-phone');
  const modalAcomp = document.getElementById('modal-acompanha');
  const modalRestr = document.getElementById('modal-restricoes');
  const modalSave = document.getElementById('modal-save');
  const modalCancel = document.getElementById('modal-cancel');

  let editingId = null;

  function setToken(token) {
    localStorage.setItem('admin-token', token);
    if (token) {
      loginBtn.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
    } else {
      loginBtn.classList.remove('hidden');
      logoutBtn.classList.add('hidden');
    }
  }

  async function login(password) {
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (!res.ok) throw new Error('unauthorized');
    const j = await res.json();
    setToken(j.token);
    adminArea.style.display = '';
    await refreshAll();
  }

  loginBtn.addEventListener('click', async () => {
    try { await login(passInput.value); } catch (err) { alert('Login falhou'); }
  });

  logoutBtn.addEventListener('click', () => { setToken(null); adminArea.style.display = 'none'; localStorage.removeItem('admin-token'); });

  refreshBtn.addEventListener('click', () => refreshAll());
  exportBtn.addEventListener('click', () => window.location.href = '/api/export');
  filterInput.addEventListener('input', () => loadGuests());

  document.getElementById('create-table-btn').addEventListener('click', async () => {
    const name = document.getElementById('new-table-name').value;
    const capacity = parseInt(document.getElementById('new-table-capacity').value || '0', 10);
    if (!name) return alert('Nome requerido');
    const token = localStorage.getItem('admin-token');
    await fetch('/api/tables', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token || '' }, body: JSON.stringify({ name, capacity }) });
    document.getElementById('new-table-name').value = '';
    document.getElementById('new-table-capacity').value = '';
    await refreshAll();
  });

  async function loadGuests() {
    const res = await fetch('/api/guests');
    const guests = await res.json();
    const filter = (filterInput.value||'').toLowerCase();
    const filtered = guests.filter(g => !filter || (g.nome||'').toLowerCase().includes(filter) || (g.email||'').toLowerCase().includes(filter));

    statTotal.innerText = guests.length;
    statConfirmed.innerText = guests.filter(g => g.acompanha).length;
    statCheckin.innerText = guests.filter(g => g.checked_in).length;

    tbody.innerHTML = '';
    filtered.forEach(g => {
      const tr = document.createElement('tr');
      tr.className = 'align-top';
      tr.innerHTML = `
        <td class="py-3 pr-4">${escapeHtml(g.nome||'')}</td>
        <td class="py-3 pr-4">${escapeHtml(g.email||'')}</td>
        <td class="py-3 pr-4">${escapeHtml(g.telefone||'')}</td>
        <td class="py-3 pr-4">${g.acompanha ? 'Sim' : 'Não'}</td>
        <td class="py-3 pr-4">${g.checked_in ? 'Sim' : 'Não'}</td>
        <td class="py-3 pr-4">${g.mesa_id || ''}</td>
        <td class="py-3 pr-4">
          <div class="flex items-center gap-2">
            <button class="btn-edit bg-gray-100 px-2 py-1 rounded" data-id="${g.id}">Editar</button>
            <button class="btn-qr bg-gray-100 px-2 py-1 rounded" data-id="${g.id}">QR</button>
            <button class="btn-check bg-green-100 px-2 py-1 rounded" data-id="${g.id}">Check-in</button>
            <button class="btn-del bg-red-100 px-2 py-1 rounded" data-id="${g.id}">Eliminar</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    attachRowHandlers();
  }

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  async function loadTables() {
    const res = await fetch('/api/tables');
    const tables = await res.json();
    const list = document.getElementById('tables-list');
    list.innerHTML = '';
    tables.forEach(t => {
      const div = document.createElement('div');
      div.className = 'p-2 border rounded flex items-center justify-between';
      div.innerHTML = `<div><strong>${t.name}</strong><div class="text-xs text-gray-500">cap: ${t.capacity}</div></div><div class="text-xs text-gray-400">${t.id.slice(0,6)}</div>`;
      list.appendChild(div);
    });
  }

  async function loadSeating() {
    const [tRes, gRes] = await Promise.all([fetch('/api/tables'), fetch('/api/guests')]);
    const tables = await tRes.json();
    const guests = await gRes.json();
    const seat = document.getElementById('seating-area');
    seat.innerHTML = '';

    const pool = document.createElement('div');
    pool.className = 'p-3 border rounded';
    pool.innerHTML = '<strong>Sem mesa</strong><div class="mt-2 guest-list"></div>';
    const poolList = pool.querySelector('.guest-list');
    guests.filter(g => !g.mesa_id).forEach(g => poolList.appendChild(createGuestCard(g)));
    seat.appendChild(pool);

    tables.forEach(t => {
      const div = document.createElement('div');
      div.className = 'p-3 border rounded';
      div.dataset.tableId = t.id;
      div.innerHTML = `<strong>${t.name}</strong><div class="mt-2 guest-list" style="min-height:40px;"></div>`;
      const list = div.querySelector('.guest-list');
      guests.filter(g => g.mesa_id === t.id).forEach(g => list.appendChild(createGuestCard(g)));

      div.addEventListener('dragover', (e) => { e.preventDefault(); div.classList.add('bg-rose-50'); });
      div.addEventListener('dragleave', () => div.classList.remove('bg-rose-50'));
      div.addEventListener('drop', async (e) => {
        e.preventDefault(); div.classList.remove('bg-rose-50');
        const guestId = e.dataTransfer.getData('text/plain');
        const token = localStorage.getItem('admin-token');
        await fetch(`/api/guests/${guestId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token || '' }, body: JSON.stringify({ table_id: t.id }) });
        await refreshAll();
      });

      seat.appendChild(div);
    });
  }

  function createGuestCard(g){
    const gdiv = document.createElement('div');
    gdiv.className = 'p-2 border mb-2 bg-white rounded cursor-move';
    gdiv.draggable = true;
    gdiv.dataset.id = g.id;
    gdiv.textContent = g.nome || g.email;
    gdiv.addEventListener('dragstart', (ev) => ev.dataTransfer.setData('text/plain', g.id));
    return gdiv;
  }

  function attachRowHandlers(){
    document.querySelectorAll('.btn-edit').forEach(b => b.onclick = async (e) => {
      const id = b.dataset.id; editingId = id;
      const res = await fetch(`/api/guest/${id}`); const j = await res.json();
      modalName.value = j.nome || '';
      modalEmail.value = j.email || '';
      modalPhone.value = j.telefone || '';
      modalAcomp.value = j.acompanha ? '1' : '0';
      modalRestr.value = j.restricoes || '';
      modal.classList.remove('hidden');
    });

    document.querySelectorAll('.btn-qr').forEach(b => b.onclick = async () => {
      const id = b.dataset.id; const r = await fetch(`/api/guest/${id}`); const j = await r.json();
      if (j.qr) { const w = window.open(''); w.document.write(`<img src="${j.qr}" alt="QR"/>`); } else alert('Sem QR');
    });

    document.querySelectorAll('.btn-check').forEach(b => b.onclick = async () => {
      const id = b.dataset.id; const token = localStorage.getItem('admin-token');
      await fetch(`/api/guests/${id}/checkin`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token || '' }, body: JSON.stringify({ present: true }) });
      await loadGuests();
    });

    document.querySelectorAll('.btn-del').forEach(b => b.onclick = async () => {
      if (!confirm('Eliminar convidado?')) return; const id = b.dataset.id; const token = localStorage.getItem('admin-token');
      await fetch(`/api/guests/${id}`, { method: 'DELETE', headers: { 'x-admin-token': token || '' } });
      await refreshAll();
    });
  }

  modalCancel.addEventListener('click', () => modal.classList.add('hidden'));
  modalSave.addEventListener('click', async () => {
    if (!editingId) return; const token = localStorage.getItem('admin-token');
    await fetch(`/api/guests/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-token': token || '' }, body: JSON.stringify({ nome: modalName.value, email: modalEmail.value, telefone: modalPhone.value, acompanha: modalAcomp.value === '1' ? 1 : 0, restricoes: modalRestr.value }) });
    modal.classList.add('hidden'); await refreshAll();
  });

  async function refreshAll(){ await loadGuests(); await loadTables(); await loadSeating(); }

  if (localStorage.getItem('admin-token')) { setToken(localStorage.getItem('admin-token')); adminArea.style.display = ''; refreshAll(); }

})();
