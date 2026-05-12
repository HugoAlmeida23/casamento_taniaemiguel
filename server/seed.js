const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(DB_FILE);

// Clear existing data and re-seed
db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS guests`);
  db.run(`DROP TABLE IF EXISTS tables`);

  db.run(`CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    acompanha INTEGER,
    restricoes TEXT,
    mesa_id TEXT,
    qr_code TEXT,
    created_at TEXT,
    checked_in INTEGER DEFAULT 0,
    checkin_time TEXT DEFAULT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY,
    name TEXT,
    capacity INTEGER
  )`);

  // Tables
  const tables = [
    { id: uuidv4(), name: 'Mesa 1', capacity: 8 },
    { id: uuidv4(), name: 'Mesa 2', capacity: 8 },
    { id: uuidv4(), name: 'Mesa 3', capacity: 6 },
    { id: uuidv4(), name: 'Mesa 4', capacity: 6 },
    { id: uuidv4(), name: 'Mesa dos Noivos', capacity: 10 },
  ];

  tables.forEach(t => {
    db.run(`INSERT INTO tables (id, name, capacity) VALUES (?, ?, ?)`, [t.id, t.name, t.capacity]);
  });

  // Guests — fill all tables, leaving only 1 empty seat on Mesa 1 and 1 on Mesa 4
  const guests = [
    // Mesa 1 (8 capacity, 7 guests — 1 empty seat)
    { nome: 'Ana Silva', mesa: 0 },
    { nome: 'Pedro Silva', mesa: 0 },
    { nome: 'João Costa', mesa: 0 },
    { nome: 'Rita Costa', mesa: 0 },
    { nome: 'Mariana Ferreira', mesa: 0 },
    { nome: 'Tiago Fernandes', mesa: 0 },
    { nome: 'Beatriz Santos', mesa: 0 },

    // Mesa 2 (8 capacity, 8 guests — full)
    { nome: 'Carlos Mendes', mesa: 1 },
    { nome: 'Sofia Mendes', mesa: 1 },
    { nome: 'Inês Rodrigues', mesa: 1 },
    { nome: 'Miguel Alves', mesa: 1 },
    { nome: 'Diogo Oliveira', mesa: 1 },
    { nome: 'Catarina Lopes', mesa: 1 },
    { nome: 'André Pereira', mesa: 1 },
    { nome: 'Marta Sousa', mesa: 1 },

    // Mesa 3 (6 capacity, 6 guests — full)
    { nome: 'Rui Martins', mesa: 2 },
    { nome: 'Filipa Gomes', mesa: 2 },
    { nome: 'Nuno Ribeiro', mesa: 2 },
    { nome: 'Sara Cardoso', mesa: 2 },
    { nome: 'Hugo Pinto', mesa: 2 },
    { nome: 'Joana Correia', mesa: 2 },

    // Mesa 4 (6 capacity, 5 guests — 1 empty seat)
    { nome: 'Luís Almeida', mesa: 3 },
    { nome: 'Teresa Vieira', mesa: 3 },
    { nome: 'Francisco Neves', mesa: 3 },
    { nome: 'Daniela Rocha', mesa: 3 },
    { nome: 'Gonçalo Faria', mesa: 3 },

    // Mesa dos Noivos (10 capacity, 10 guests — full)
    { nome: 'Tânia Noiva', mesa: 4 },
    { nome: 'Miguel Noivo', mesa: 4 },
    { nome: 'Maria Mãe da Noiva', mesa: 4 },
    { nome: 'José Pai da Noiva', mesa: 4 },
    { nome: 'Helena Mãe do Noivo', mesa: 4 },
    { nome: 'António Pai do Noivo', mesa: 4 },
    { nome: 'Carolina Irmã da Noiva', mesa: 4 },
    { nome: 'Ricardo Irmão do Noivo', mesa: 4 },
    { nome: 'Avó Conceição', mesa: 4 },
    { nome: 'Avô Manuel', mesa: 4 },
  ];

  guests.forEach(g => {
    const id = uuidv4();
    const mesaId = tables[g.mesa].id;
    db.run(
      `INSERT INTO guests (id, nome, email, telefone, acompanha, restricoes, mesa_id, qr_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, g.nome, `${g.nome.toLowerCase().replace(/\s/g, '.')}@email.com`, '+351 9' + Math.floor(10000000 + Math.random() * 90000000), 1, null, mesaId, '', new Date().toISOString()]
    );
  });

  console.log(`Inserted ${tables.length} tables and ${guests.length} guests`);
  console.log('Mesa 1: 7/8 (1 empty seat)');
  console.log('Mesa 2: 8/8 (full)');
  console.log('Mesa 3: 6/6 (full)');
  console.log('Mesa 4: 5/6 (1 empty seat)');
  console.log('Mesa dos Noivos: 10/10 (full)');
});

db.close(() => {
  console.log('\nSeed complete!');
});
