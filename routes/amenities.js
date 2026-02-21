const express = require('express');
const router = express.Router();
const { initDB, prepare } = require('../database/db');

// GET /api/amenities – list all amenities
router.get('/', async (req, res) => {
    try {
        await initDB();
        const amenities = prepare('SELECT * FROM amenities ORDER BY name').all();
        res.json(amenities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/amenities/:id/classrooms – classrooms that have this amenity
router.get('/:id/classrooms', async (req, res) => {
    try {
        await initDB();
        const classrooms = prepare(`
            SELECT c.*, b.name AS block_name
            FROM classroom_amenities ca
            JOIN classrooms c ON ca.classroom_id = c.id
            JOIN blocks b ON c.block_id = b.id
            WHERE ca.amenity_id = ?
            ORDER BY c.id
        `).all(req.params.id);
        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
