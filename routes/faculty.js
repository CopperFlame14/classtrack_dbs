const express = require('express');
const router = express.Router();
const { initDB, prepare } = require('../database/db');

// GET /api/faculty – list all faculty with department info
router.get('/', async (req, res) => {
    try {
        await initDB();
        const facultyList = prepare(`
            SELECT f.*, d.name AS department_name, b.name AS block_name
            FROM faculty f
            JOIN departments d ON f.department_id = d.id
            JOIN blocks b ON d.block_id = b.id
            ORDER BY f.name
        `).all();
        res.json(facultyList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/faculty/:id – single faculty member
router.get('/:id', async (req, res) => {
    try {
        await initDB();
        const member = prepare(`
            SELECT f.*, d.name AS department_name, b.name AS block_name
            FROM faculty f
            JOIN departments d ON f.department_id = d.id
            JOIN blocks b ON d.block_id = b.id
            WHERE f.id = ?
        `).get(req.params.id);
        if (!member) return res.status(404).json({ error: 'Faculty member not found' });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
