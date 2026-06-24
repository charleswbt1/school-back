const express = require('express');
const router = express.Router();
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const QueryRepository = require('../repositories/query-repository.js');
const CourseRegisterRequest = require('../dto/course-dto.js');
const ContentRegisterRequest = require('../dto/content-dto.js');
const PeriodRegisterRequest = require('../dto/period-dto.js');

const repositoryName = 'courses';

router.post('', async (req, res) => {
    try {
        const request = new CourseRegisterRequest(req.body);
        const content = await Repository.getById(request.content_id, "contents");
        request.content = new ContentRegisterRequest(content);

        const toDay = new Date();
        const month = toDay.toLocaleString('es-MX', { month: 'long' }).toUpperCase();
        const year = toDay.getFullYear();
        request.month = month;
        request.year = `${year}`;
        const periods = await QueryRepository.getPeriod(request.coordinator_id, month, year);
        if (periods.length > 0) {
            const period = periods[0];
            period.courses.push(request.name);
            await Repository.update(period.id, period, 'periods');
        } else {
            const newPeriod = {
                coordinator_id: request.coordinator_id,
                month: month,
                year: year,
                courses: [request.name]
            }
            await Repository.create(newPeriod, 'periods');
        }
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
        const state = req.query.state;
        const year = req.query.year;
        const month = req.query.month;
        const coordinatorId = req.query.coordinator_id;
        var entities;
        if (year && month) {
            entities = await QueryRepository.getCoursesByPeriod(coordinatorId, month, year);
        } else if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            entities = await Repository.getByState(state || 'active', repositoryName);
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
        const request = new CourseRegisterRequest(req.body);
        const entity = await Repository.update(id, request, repositoryName);
        res.status(200).json(Utils.formatDates(entity));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});
router.delete('', async (req, res) => {
    try {
        const id = req.query.id;
        const result = await Repository.delete(id, repositoryName);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

router.get('/periods', async (req, res) => {
    try {
        const coordinatorId = req.query.coordinator_id;
        const entities = await QueryRepository.getPeriodsByCoordinator(coordinatorId);
        res.status(200).json(entities.map(Utils.formatDates));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});
router.get('/students', async (req, res) => {
    try {
        const courseId = req.query.course_id;
        const entities = await QueryRepository.getStudentsByCourseId(courseId);
        res.status(200).json(entities.map(Utils.formatDates));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

module.exports = router;
