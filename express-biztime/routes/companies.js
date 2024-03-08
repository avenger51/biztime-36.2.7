const express = require('express');
const router = express.Router();
const db = require('../db');


router.use(express.json());

// GET /companies 
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT code, name FROM companies');
    return res.json({ companies: result.rows });
  } catch (err) {
    console.error('Error fetching companies:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /companies/:code 
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    console.error('Error fetching company:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /companies 
router.post('/', async (req, res) => {
  const { code, name, description } = req.body;
  try {
    const result = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *', [code, name, description]);
    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    console.error('Error adding company:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /companies/:code 
router.put('/:code', async (req, res) => {
  const { code } = req.params;
  const { name, description } = req.body;
  try {
    const result = await db.query('UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING *', [name, description, code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    console.error('Error updating company:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /companies/:code 
router.delete('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await db.query('DELETE FROM companies WHERE code = $1 RETURNING *', [code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    return res.json({ status: 'deleted' });
  } catch (err) {
    console.error('Error deleting company:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
