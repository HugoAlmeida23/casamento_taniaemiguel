import React, { useEffect, useState } from 'react';
import { Button } from './components/Button';
import { Card, StatCard } from './components/Card';
import { Modal } from './components/Modal';
import { Input, Select } from './components/Input';
import { Badge } from './components/Badge';
import { supabase } from './supabase';

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

type PhotoRecord = {
  id: string;
  storage_path: string;
  uploader_name: string;
  created_at: string;
  is_visible: boolean;
};

const ADMIN_PASS = 'changeme'; // Same password as before — change in production

function App() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Guest | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin-token'));
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [activeView, setActiveView] = useState<'guests' | 'tables' | 'photos'>('guests');
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('admin-token', token);
      refreshAll();
    }
  }, [token]);

  useEffect(() => {
    if (token && activeView === 'photos') {
      loadPhotos();
    }
  }, [token, activeView]);

  async function refreshAll() {
    setLoading(true);
    await Promise.all([loadGuests(), loadTables()]);
    setLoading(false);
  }

  async function loadGuests() {
    try {
      const { data, error } = await supabase.from('guests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setGuests(data || []);
    } catch (err) {
      console.error('Failed to load guests', err);
    }
  }

  async function loadTables() {
    try {
      const { data, error } = await supabase.from('tables').select('*');
      if (error) throw error;
      setTables(data || []);
    } catch (err) {
      console.error('Failed to load tables', err);
    }
  }

  async function loadPhotos() {
    setPhotosLoading(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('Failed to load photos', err);
    } finally {
      setPhotosLoading(false);
    }
  }

  async function deletePhoto(photo: PhotoRecord) {
    if (!token) {
      alert('Sessão expirada. Faça login novamente.');
      return;
    }
    setDeleting(true);
    try {
      // Delete from Supabase Storage first
      const { error: storageError } = await supabase.storage
        .from('wedding-photos')
        .remove([photo.storage_path]);
      if (storageError) {
        alert('Erro ao eliminar ficheiro.');
        return;
      }

      // Delete the record from the database
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);
      if (dbError) {
        alert('Erro ao eliminar registo.');
        return;
      }

      // Remove from local state
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      setPhotoToDelete(null);
    } catch (err) {
      console.error('Failed to delete photo', err);
      alert('Erro ao eliminar foto.');
    } finally {
      setDeleting(false);
    }
  }

  function getThumbnailUrl(storagePath: string): string {
    const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/render/image/public/wedding-photos/${storagePath}?width=400`;
  }

  function formatTimestamp(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (password === ADMIN_PASS) {
        setToken('authenticated');
        setPassword('');
      } else {
        throw new Error('Login failed');
      }
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

  function exportCSV() {
    const header = ['id', 'nome', 'email', 'telefone', 'acompanha', 'restricoes', 'mesa_id', 'created_at'];
    const csv = [header.join(',')]
      .concat(guests.map(g => header.map(h => `"${String((g as any)[h] ?? '')}"`).join(',')))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guests.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function createTable(name: string, capacity: number) {
    try {
      const { error } = await supabase.from('tables').insert({ name, capacity });
      if (error) throw error;
      await loadTables();
      setShowTableModal(false);
    } catch (err) {
      alert('Erro ao criar mesa');
    }
  }

  async function saveGuest(g: Guest) {
    try {
      const { error } = await supabase
        .from('guests')
        .update({ nome: g.nome, email: g.email, telefone: g.telefone, restricoes: g.restricoes, mesa_id: g.mesa_id })
        .eq('id', g.id);
      if (error) throw error;
      setEditing(null);
      await loadGuests();
    } catch (err) {
      alert('Erro ao guardar convidado');
    }
  }

  async function deleteGuest(guestId: string) {
    if (!confirm('Tem certeza que deseja eliminar este convidado?')) return;
    try {
      const { error } = await supabase.from('guests').delete().eq('id', guestId);
      if (error) throw error;
      await refreshAll();
    } catch (err) {
      alert('Erro ao eliminar');
    }
  }

  async function checkIn(guestId: string) {
    try {
      const { error } = await supabase
        .from('guests')
        .update({ checked_in: 1, checkin_time: new Date().toISOString() })
        .eq('id', guestId);
      if (error) throw error;
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
              <Button variant="secondary" size="sm" onClick={exportCSV}>
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
          <button
            onClick={() => setActiveView('photos')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeView === 'photos'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Fotos
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
        ) : activeView === 'tables' ? (
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
        ) : (
          /* Photos View */
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Galeria de Fotos</h2>
                <p className="text-sm text-gray-500">{photos.length} foto{photos.length !== 1 ? 's' : ''} enviada{photos.length !== 1 ? 's' : ''}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={loadPhotos} isLoading={photosLoading}>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              </Button>
            </div>

            {photosLoading && photos.length === 0 ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-rose-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500">A carregar fotos...</p>
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Nenhuma foto enviada ainda</p>
                <p className="text-gray-400 text-sm mt-1">As fotos dos convidados aparecerão aqui</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="group relative bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={getThumbnailUrl(photo.storage_path)}
                        alt={`Foto de ${photo.uploader_name}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{photo.uploader_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatTimestamp(photo.created_at)}</p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setPhotoToDelete(photo)}
                        className="shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Delete Photo Confirmation Modal */}
      <Modal
        isOpen={!!photoToDelete}
        onClose={() => setPhotoToDelete(null)}
        title="Eliminar Foto"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPhotoToDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => photoToDelete && deletePhoto(photoToDelete)}
              isLoading={deleting}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-700 mb-2">Tem certeza que deseja eliminar esta foto?</p>
          {photoToDelete && (
            <p className="text-sm text-gray-500">
              Enviada por <span className="font-medium">{photoToDelete.uploader_name}</span> em {formatTimestamp(photoToDelete.created_at)}
            </p>
          )}
          <p className="text-xs text-red-500 mt-3">Esta ação não pode ser revertida.</p>
        </div>
      </Modal>
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
