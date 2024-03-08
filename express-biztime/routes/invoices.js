const express = require('express');
const router = express.Router();
const db = require('../db');


router.use(express.json());

// GET /invoices
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, comp_code FROM invoices');
    return res.json({ invoices: result.rows });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /invoices/:id 
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const invoice = result.rows[0];
    const companyResult = await db.query('SELECT * FROM companies WHERE code = $1', [invoice.comp_code]);
    const company = companyResult.rows[0];
    invoice.company = company;
    return res.json({ invoice });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /invoices
router.post('/', async (req, res) => {
  const { comp_code, amt } = req.body;
  try {
    const result = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', [comp_code, amt]);
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    console.error('Error adding invoice:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /invoices/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { amt } = req.body;
  try {
    const result = await db.query('UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING *', [amt, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    console.error('Error updating invoice:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /invoices/:id 
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM invoices WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    return res.json({ status: 'deleted' });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update GET /companies/:code 
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await db.query('SELECT * FROM companies WHERE code = $1', [code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    const company = result.rows[0];
    const invoiceResult = await db.query('SELECT id FROM invoices WHERE comp_code = $1', [code]);
    company.invoices = invoiceResult.rows.map(row => row.id);
    return res.json({ company });
  } catch (err) {
    console.error('Error fetching company:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
