const express = require('express');
const router = express.Router();
const { initDB, prepare } = require('../database/db');

// GET /api/departments – list all departments with block info
router.get('/', async (req, res) => {
    try {
        await initDB();
        const departments = prepare(`
            SELECT d.*, b.name AS block_name
            FROM departments d
            JOIN blocks b ON d.block_id = b.id
            ORDER BY d.name
        `).all();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/departments/:id – single dept with courses and faculty
router.get('/:id', async (req, res) => {
    try {
        await initDB();
        const dept = prepare(`
            SELECT d.*, b.name AS block_name
            FROM departments d
            JOIN blocks b ON d.block_id = b.id
            WHERE d.id = ?
        `).get(req.params.id);
        if (!dept) return res.status(404).json({ error: 'Department not found' });

        const courses = prepare(
            'SELECT * FROM courses WHERE department_id = ? ORDER BY code'
        ).all(req.params.id);

        const facultyList = prepare(
            'SELECT * FROM faculty WHERE department_id = ? ORDER BY name'
        ).all(req.params.id);

        res.json({ ...dept, courses, faculty: facultyList });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
