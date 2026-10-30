const express = require('express');
const router = express.Router();
const authenticateToken = require('../config/auth-middleware.js');
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const AttendanceDto = require('../dto/attendance-dto.js');

const repositoryName = 'attendances';

router.post('', authenticateToken, async (req, res) => {
    try {
        const request = new AttendanceDto(req.body);
        const entity = await Repository.create(
            request, repositoryName, { user: req.user }
        );
        res.status(201).json(Utils.formatDates(entity));
    } catch (error) {
        console.error('attendances post', error);
        res.status(409).json({ message: 'Fallo al registrar asistencia' });
    }
});
router.get('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const courseId = req.query.course_id;
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
            if (teacherId) {
                filters.push(['teacher_id', '==', teacherId]);
            }
            entities = await Repository.query(repositoryName, filters);
        }
        res.status(200).json(entities.map(Utils.formatDates));
    } catch (error) {
        console.error('attendances get', error);
        res.status(412).json({ message: 'Fallo al consultar asistencia' });
    }
});
router.patch('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const entity = await Repository.update(
            id, req.body, repositoryName, { user: req.user }
        );
        res.status(200).json(Utils.formatDates(entity));
    } catch (error) {
        console.error('attendances patch', error);
        res.status(412).json({ message: 'Fallo al actualizar asistencia' });
    }
});

module.exports = router;