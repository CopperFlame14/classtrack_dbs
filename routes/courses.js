const express = require('express');
const router = express.Router();
const { initDB, prepare } = require('../database/db');

// GET /api/courses – list all courses with department info
router.get('/', async (req, res) => {
    try {
        await initDB();
        const courses = prepare(`
            SELECT c.*, d.name AS department_name
            FROM courses c
            JOIN departments d ON c.department_id = d.id
            ORDER BY c.code
        `).all();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/courses/:id – single course
router.get('/:id', async (req, res) => {
    try {
        await initDB();
        const course = prepare(`
            SELECT c.*, d.name AS department_name, b.name AS block_name
            FROM courses c
            JOIN departments d ON c.department_id = d.id
            JOIN blocks b ON d.block_id = b.id
            WHERE c.id = ?
        `).get(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
