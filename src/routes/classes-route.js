const express = require('express');
const router = express.Router();
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const ClassesDto = require('../dto/classes-dto.js');

const repositoryName = 'classes';

router.post('', async (req, res) => {
    try {
        const request = new ClassesDto(req.body);
        const entity = await Repository.create(request, repositoryName);
        res.status(201).json(Utils.formatDates(entity));
    } catch (error) {
        console.error(error);
        res.status(409).json({ message: error.message });
    }
});
router.get('', async (req, res) => {
    try {
        const id = req.query.id;
        const courseId = req.query.course_id;
        const moduleId = req.query.module_id;
        const teacherId = req.query.teacher_id;
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            const filters = [];
            if (courseId) {
                filters.push(['course_id', '==', courseId]);
            }
            if (moduleId) {
                filters.push(['module_id', '==', moduleId]);
            }
            if (teacherId) {
                filters.push(['teacher_id', '==', teacherId]);
            }
            entities = await Repository.query(repositoryName, filters);
        }
        res.status(200).json(entities.map(Utils.formatDates));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});
router.patch('', async (req, res) => {
    try {
        const id = req.query.id;
        const entity = await Repository.update(id, req.body, repositoryName);
        res.status(200).json(Utils.formatDates(entity));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

module.exports = router;
