const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'data.sqlite'));
const { v4: uuidv4 } = require('uuid');

db.serialize(() => {
  const id = uuidv4();
  db.run(`INSERT OR IGNORE INTO guests (id,nome,email,telefone,acompanha,restricoes,mesa_id,qr_code,created_at) VALUES (?,?,?,?,?,?,?,?,?)`, [id, 'Teste Convidado', 'teste@example.com', '912345678', 0, 'Nenhuma', null, '', new Date().toISOString()], function (err) {
    if (err) console.error(err);
    else console.log('Inserted demo guest');
  });

  const tid = uuidv4();
  db.run(`INSERT OR IGNORE INTO tables (id,name,capacity) VALUES (?,?,?)`, [tid, 'Mesa A', 8], function (err) {
    if (err) console.error(err);
    else console.log('Inserted demo table');
  });
});

db.close();
