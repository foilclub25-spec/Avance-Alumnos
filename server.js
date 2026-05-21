const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://foilclub25_db_user:MXQzYxgceGz43DoQ@cluster0.5riw0gy.mongodb.net/?appName=Cluster0';
const DB_NAME = 'foilclub';

let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Conectado a MongoDB');
}

// GET datos
app.get('/api/data', async (req, res) => {
  try {
    const col = db.collection('datos');
    const doc = await col.findOne({ _id: 'main' });
    if (!doc) {
      res.json({ students: [], disciplines: [] });
    } else {
      res.json({ students: doc.students, disciplines: doc.disciplines });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST guardar datos
app.post('/api/data', async (req, res) => {
  try {
    const col = db.collection('datos');
    const { students, disciplines } = req.body;
    await col.updateOne(
      { _id: 'main' },
      { $set: { students, disciplines } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Servir la app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
});
