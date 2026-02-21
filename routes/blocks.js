const express = require('express');
const router = express.Router();
const { initDB, prepare } = require('../database/db');

// GET /api/blocks – list all blocks
router.get('/', async (req, res) => {
    try {
        await initDB();
        const blocks = prepare('SELECT * FROM blocks ORDER BY id').all();
        res.json(blocks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/blocks/:id – single block with its classrooms
router.get('/:id', async (req, res) => {
    try {
        await initDB();
        const block = prepare('SELECT * FROM blocks WHERE id = ?').get(req.params.id);
        if (!block) return res.status(404).json({ error: 'Block not found' });

        const classrooms = prepare(
            'SELECT * FROM classrooms WHERE block_id = ? ORDER BY floor, id'
        ).all(req.params.id);

        const departments = prepare(
            'SELECT * FROM departments WHERE block_id = ? ORDER BY name'
        ).all(req.params.id);

        res.json({ ...block, classrooms, departments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
