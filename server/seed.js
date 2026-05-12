const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'data.sqlite'));
const { v4: uuidv4 } = require('uuid');

const guests = [
  { nome: 'Ana Silva', email: 'ana@example.com', telefone: '+351 912 345 678', restricoes: 'Vegetariana' },
  { nome: 'João Costa', email: 'joao@example.com', telefone: '+351 916 789 012', restricoes: '' },
  { nome: 'Mariana Ferreira', email: 'mariana@example.com', telefone: '+351 910 111 222', restricoes: 'Sem glúten' },
  { nome: 'Carlos Mendes', email: 'carlos@example.com', telefone: '+351 913 444 555', restricoes: '' },
  { nome: 'Inês Rodrigues', email: 'ines@example.com', telefone: '+351 914 666 777', restricoes: 'Vegan' },
  { nome: 'Pedro Silva', email: 'pedro@example.com', telefone: '+351 915 111 222', restricoes: '' },
  { nome: 'Rita Costa', email: 'rita@example.com', telefone: '+351 916 333 444', restricoes: 'Alergia a marisco' },
  { nome: 'Sofia Mendes', email: 'sofia@example.com', telefone: '+351 917 555 666', restricoes: '' },
  { nome: 'Miguel Alves', email: 'miguel@example.com', telefone: '+351 918 777 888', restricoes: 'Vegan' },
  { nome: 'Tiago Fernandes', email: 'tiago@example.com', telefone: '+351 919 999 000', restricoes: '' },
  { nome: 'Beatriz Santos', email: 'beatriz@example.com', telefone: '+351 920 111 333', restricoes: '' },
  { nome: 'Diogo Oliveira', email: 'diogo@example.com', telefone: '+351 921 444 666', restricoes: 'Intolerância à lactose' },
];

const tables = [
  { name: 'Mesa 1', capacity: 8 },
  { name: 'Mesa 2', capacity: 8 },
  { name: 'Mesa 3', capacity: 6 },
  { name: 'Mesa 4', capacity: 6 },
  { name: 'Mesa dos Noivos', capacity: 10 },
];

db.serialize(() => {
  // Create tables
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

  // Insert tables and collect IDs
  const tableIds = [];
  tables.forEach((table, index) => {
    const id = uuidv4();
    tableIds.push(id);
    db.run(
      `INSERT INTO tables (id, name, capacity) VALUES (?, ?, ?)`,
      [id, table.name, table.capacity],
      function (err) {
        if (err) console.error(`Error inserting table ${table.name}:`, err.message);
        else console.log(`Inserted table: ${table.name} (${id})`);
      }
    );
  });

  // Insert guests and assign some to tables
  setTimeout(() => {
    guests.forEach((guest, index) => {
      const id = uuidv4();
      // Assign first few guests to tables for demo purposes
      let mesaId = null;
      if (index < 3) mesaId = tableIds[0]; // Mesa 1
      else if (index < 5) mesaId = tableIds[1]; // Mesa 2
      else if (index < 8) mesaId = tableIds[2]; // Mesa 3
      else if (index < 10) mesaId = tableIds[3]; // Mesa 4
      // Last 2 guests unassigned

      db.run(
        `INSERT INTO guests (id, nome, email, telefone, acompanha, restricoes, mesa_id, qr_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, guest.nome, guest.email, guest.telefone, 1, guest.restricoes || null, mesaId, '', new Date().toISOString()],
        function (err) {
          if (err) console.error(`Error inserting guest ${guest.nome}:`, err.message);
          else console.log(`Inserted guest: ${guest.nome} → ${mesaId ? 'assigned' : 'unassigned'}`);
        }
      );
    });

    setTimeout(() => {
      db.close(() => {
        console.log('\nSeed complete! Database populated with demo data.');
      });
    }, 1000);
  }, 500);
});
