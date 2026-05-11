import React, { useEffect, useState } from 'react';
import { Button } from './components/Button';
import { Card, StatCard } from './components/Card';
import { Modal } from './components/Modal';
import { Input, Select } from './components/Input';
import { Badge } from './components/Badge';

type Guest = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  acompanha?: number;
  restricoes?: string;
  mesa_id?: string | null;
  qr_code?: string;
  checked_in?: number;
  checkin_time?: string;
};

type Table = {
  id: string;
  name: string;
  capacity: number;
};

const API_BASE = 'http://localhost:4000';

function App() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Guest | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin-token'));
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [activeView, setActiveView] = useState<'guests' | 'tables'>('guests');

  useEffect(() => {
    if (token) {
      localStorage.setItem('admin-token', token);
      refreshAll();
    }
  }, [token]);

  async function refreshAll() {
    setLoading(true);
    await Promise.all([loadGuests(), loadTables()]);
    setLoading(false);
  }

  async function loadGuests() {
    try {
      const res = await fetch(`${API_BASE}/api/guests`);
      const j = await res.json();
      setGuests(j || []);
    } catch (err) {
      console.error('Failed to load guests', err);
    }
  }

  async function loadTables() {
    try {
      const res = await fetch(`${API_BASE}/api/tables`);
      const j = await res.json();
      setTables(j || []);
    } catch (err) {
      console.error('Failed to load tables', err);
    }
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) throw new Error('Login failed');
      const j = await res.json();
      setToken(j.token);
      setPassword('');
    } catch (err) {
      alert('Login falhou. Verifique a password.');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    localStorage.removeItem('admin-token');
    setGuests([]);
    setTables([]);
  }

  async function createTable(name: string, capacity: number) {
    try {
      await fetch(`${API_BASE}/api/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token || ''
        },
        body: JSON.stringify({ name, capacity })
      });
      await loadTables();
      setShowTableModal(false);
    } catch (err) {
      alert('Erro ao criar mesa');
    }
  }

  async function saveGuest(g: Guest) {
    try {
      await fetch(`${API_BASE}/api/guests/${g.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token || ''
        },
        body: JSON.stringify(g)
      });
      setEditing(null);
      await loadGuests();
    } catch (err) {
      alert('Erro ao guardar convidado');
    }
  }

  async function deleteGuest(guestId: string) {
    if (!confirm('Tem certeza que deseja eliminar este convidado?')) return;
    try {
      await fetch(`${API_BASE}/api/guests/${guestId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token || '' }
      });
      await refreshAll();
    } catch (err) {
      alert('Erro ao eliminar');
    }
  }

  async function checkIn(guestId: string) {
    try {
      await fetch(`${API_BASE}/api/guests/${guestId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token || ''
        },
        body: JSON.stringify({ present: true })
      });
      await loadGuests();
    } catch (err) {
      alert('Erro ao fazer check-in');
    }
  }

  const filtered = guests.filter(
    g =>
      !filter ||
      (g.nome || '').toLowerCase().includes(filter.toLowerCase()) ||
      (g.email || '').toLowerCase().includes(filter.toLowerCase())
  );

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.acompanha).length,
    checkedIn: guests.filter(g => g.checked_in).length,
    pending: guests.filter(g => !g.acompanha).length,
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-block p-4 bg-rose-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Admin</h1>
            <p className="text-gray-600">Casamento Tânia & Miguel</p>
          </div>

          <Card className="animate-slideUp">
            <form onSubmit={doLogin} className="space-y-4">
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Digite a password de administrador"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                }
              />
              <Button type="submit" className="w-full" isLoading={loading}>
                Entrar
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Admin</h1>
                <p className="text-xs text-gray-500">Tânia & Miguel</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={refreshAll} isLoading={loading}>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
              <Button variant="secondary" size="sm" onClick={() => (window.location.href = `${API_BASE}/api/export`)}>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Convidados"
            value={stats.total}
            color="rose"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Confirmados"
            value={stats.confirmed}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Check-ins"
            value={stats.checkedIn}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
          />
          <StatCard
            title="Pendentes"
            value={stats.pending}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Nav Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveView('guests')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeView === 'guests'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Convidados
          </button>
          <button
            onClick={() => setActiveView('tables')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeView === 'tables'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Mesas
          </button>
        </div>

        {/* Content */}
        {activeView === 'guests' ? (
          <Card
            title="Lista de Convidados"
            subtitle={`${filtered.length} convidado${filtered.length !== 1 ? 's' : ''}`}
            headerAction={
              <Input
                placeholder="Procurar..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-64"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-left border-b border-gray-200">
                  <tr>
                    <th className="pb-3 text-sm font-semibold text-gray-700">Nome</th>
                    <th className="pb-3 text-sm font-semibold text-gray-700">Email</th>
                    <th className="pb-3 text-sm font-semibold text-gray-700">Mesa</th>
                    <th className="pb-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="pb-3 text-sm font-semibold text-gray-700 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-sm font-medium text-gray-900">{g.nome}</td>
                      <td className="py-4 text-sm text-gray-600">{g.email}</td>
                      <td className="py-4 text-sm">
                        {g.mesa_id ? (
                          <Badge variant="info">{tables.find(t => t.id === g.mesa_id)?.name || g.mesa_id.slice(0, 8)}</Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {g.acompanha ? <Badge variant="success">Confirmado</Badge> : <Badge variant="default">Pendente</Badge>}
                          {g.checked_in ? <Badge variant="info">Check-in ✓</Badge> : null}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditing(g)}>
                            Editar
                          </Button>
                          {!g.checked_in && (
                            <Button size="sm" variant="secondary" onClick={() => checkIn(g.id)}>
                              Check-in
                            </Button>
                          )}
                          <Button size="sm" variant="danger" onClick={() => deleteGuest(g.id)}>
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-dashed border-gray-300 hover:border-rose-400 transition-colors cursor-pointer" onClick={() => setShowTableModal(true)}>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-3 bg-rose-100 rounded-full mb-3">
                  <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Nova Mesa</h3>
                <p className="text-sm text-gray-500">Clique para adicionar</p>
              </div>
            </Card>

            {tables.map(t => {
              const tableGuests = guests.filter(g => g.mesa_id === t.id);
              return (
                <Card key={t.id} title={t.name} subtitle={`Capacidade: ${t.capacity}`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Ocupação:</span>
                      <Badge variant={tableGuests.length >= t.capacity ? 'danger' : 'success'}>
                        {tableGuests.length} / {t.capacity}
                      </Badge>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      {tableGuests.length > 0 ? (
                        <div className="space-y-1">
                          {tableGuests.slice(0, 3).map(g => (
                            <div key={g.id} className="text-sm text-gray-700 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                              {g.nome}
                            </div>
                          ))}
                          {tableGuests.length > 3 && (
                            <div className="text-sm text-gray-500 italic">
                              +{tableGuests.length - 3} mais...
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Nenhum convidado atribuído</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Edit Guest Modal */}
      {editing && (
        <Modal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          title="Editar Convidado"
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button onClick={() => saveGuest(editing)}>Guardar</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Nome"
              value={editing.nome}
              onChange={e => setEditing({ ...editing, nome: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={editing.email}
              onChange={e => setEditing({ ...editing, email: e.target.value })}
            />
            <Input
              label="Telefone"
              value={editing.telefone || ''}
              onChange={e => setEditing({ ...editing, telefone: e.target.value })}
            />
            <Select
              label="Mesa"
              value={editing.mesa_id || ''}
              onChange={e => setEditing({ ...editing, mesa_id: e.target.value || null })}
              options={[
                { value: '', label: 'Sem mesa' },
                ...tables.map(t => ({ value: t.id, label: t.name }))
              ]}
            />
            <Input
              label="Restrições Alimentares"
              value={editing.restricoes || ''}
              onChange={e => setEditing({ ...editing, restricoes: e.target.value })}
            />
          </div>
        </Modal>
      )}

      {/* Create Table Modal */}
      <CreateTableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onCreate={createTable}
      />
    </div>
  );
}

function CreateTableModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, capacity: number) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(8);

  const handleCreate = async () => {
    if (!name.trim()) return alert('Nome requerido');
    await onCreate(name, capacity);
    setName('');
    setCapacity(8);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Nova Mesa"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>Criar Mesa</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Nome da Mesa"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ex: Mesa 1, Mesa dos Noivos..."
        />
        <Input
          label="Capacidade"
          type="number"
          value={capacity}
          onChange={e => setCapacity(parseInt(e.target.value || '0'))}
          placeholder="8"
        />
      </div>
    </Modal>
  );
}

export default App;
