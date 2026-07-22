const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const Repository = require('../repositories/repository.js');

router.post('/stripe', async (req, res) => {
    try {
        console.log(`webhook stripe ${JSON.stringify(req.body)}`);
        res.status(200).json({ message: 'sucess' });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/fix', async (req, res) => {
    try {
        const courses = await Repository.query('courses');
        for (const course of courses) {
            course.model = 'sync';
            await Repository.update(course.id, course, 'courses');
        }
        res.json({
            message: 'Registros actualizados',
            total: courses.length
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;