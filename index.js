require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Crear tabla si no existe (equivalente a una migración simple)
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      precio NUMERIC(10,2) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Tabla productos lista.');
}

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Productos - Parcial 2' });
});

// GET todos
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET uno
app.get('/productos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear
app.post('/productos', async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    if (!nombre || precio === undefined) {
      return res.status(400).json({ error: 'nombre y precio son obligatorios' });
    }
    const result = await pool.query(
      'INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3) RETURNING *',
      [nombre, precio, stock || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar
app.put('/productos/:id', async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    const result = await pool.query(
      'UPDATE productos SET nombre=$1, precio=$2, stock=$3 WHERE id=$4 RETURNING *',
      [nombre, precio, stock, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/productos/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM productos WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Producto eliminado', producto: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API corriendo en puerto ${PORT}`);
  });
});
