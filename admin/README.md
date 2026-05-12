# 🎉 Admin Panel - Casamento Tânia & Miguel

Painel de administração moderno e intuitivo para gestão completa do evento de casamento.

## Stack
- **React 18** + TypeScript
- **Vite** (dev server + build)
- **Supabase** (database + storage + realtime)

## Desenvolvimento

### 1. Configurar variáveis de ambiente
Crie um ficheiro `admin/.env` com:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Instalar dependências
```bash
cd admin
npm install
```

### 3. Iniciar o admin dev server
```bash
npm run dev
```
O admin vai abrir em `http://localhost:3000`.

## Login
- Password padrão: `changeme` (definida no código — altere em produção)

## Build para produção
```bash
npm run build
npm run preview
```

## Funcionalidades
- ✅ Login com autenticação local
- ✅ Listar todos os convidados com filtro
- ✅ Editar convidados (nome, email, telefone, mesa)
- ✅ Criar e atribuir mesas
- ✅ Check-in de convidados
- ✅ Eliminar convidados
- ✅ Exportar CSV de convidados (client-side)
- ✅ Estatísticas (total, confirmados, check-ins)
- ✅ Galeria de fotos com moderação (eliminar fotos)
