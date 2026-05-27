const express = require('express');
const router = express.Router();
const Repository = require('../repositories/repository.js');

const repositoryCourses = 'courses';

router.get('/courses', async (req, res) => {
    const courses = await Repository.getAll(repositoryCourses);
    res.status(200).json(courses);
});

module.exports = router;