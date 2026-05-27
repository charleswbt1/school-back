const express = require('express');
const router = express.Router();
const Repository = require('../repositories/repository.js');
const ContentRegisterRequest = require('../dto/contentDto.js');

const repositoryCourses = 'courses';
const repositoryContent = 'contents';

router.post('/contents', async (req, res) => {
    try {
        const entity = new ContentRegisterRequest(req.body);
        const course = await Repository.create(entity, repositoryContent);
        res.status(201).json(couse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/courses', async (req, res) => {
    try {
        const entity = req.body;
        const course = await Repository.create(entity, repositoryCourses);
        res.status(201).json(couse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;