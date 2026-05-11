# 🎉 Admin Panel - Casamento Tânia & Miguel

Painel de administração moderno e intuitivo para gestão completa do evento de casamento.

## Stack
- **React 18** + TypeScript
- **Vite** (dev server + build)
- **Proxy** para `/api` → backend Express (porta 4000)

## Desenvolvimento

### 1. Instalar dependências
```bash
cd admin
npm install
```

### 2. Iniciar backend (noutra janela de terminal)
```bash
cd ..
node server/index.js
```
O backend vai correr em `http://localhost:4000`.

### 3. Iniciar o admin dev server
```bash
npm run dev
```
O admin vai abrir em `http://localhost:3000`.

## Login
- Password padrão: `demo-pass` (ou o valor definido em `server/.env` como `ADMIN_PASS`)
- Ou use o token demo: `demo-token`

## Build para produção
```bash
npm run build
npm run preview
```

## Funcionalidades
- ✅ Login com autenticação via token
- ✅ Listar todos os convidados com filtro
- ✅ Editar convidados (nome, email, telefone, mesa)
- ✅ Criar e atribuir mesas
- ✅ Check-in de convidados
- ✅ Eliminar convidados
- ✅ Exportar CSV de convidados
- ✅ Estatísticas (total, confirmados, check-ins)
