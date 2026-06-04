const express = require('express');
const router = express.Router();
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const QueryRepository = require('../repositories/query-repository.js');
const StudentRegisterRequest = require('../dto/student-dto.js');
const ContentRegisterRequest = require('../dto/content-dto.js');

const repositoryName = 'students';

router.post('', async (req, res) => {
    try {
        const request = new StudentRegisterRequest(req.body);
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
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        }
        else {
            entities = await Repository.getAll(repositoryName);
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
        const request = new StudentRegisterRequest(req.body);
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

router.post('/register', async (req, res) => {
    const { user_id, course_id } = req.body;
    try {
        const student = await QueryRepository.getStudentByCourseIdAndUserId(course_id, user_id);
        if (student) {
            return res.status(201).json({
                id: student.id,
                user_id: student.user_id
            });
        }

        const result = await Repository.getById(user_id, 'users');
        const course = await Repository.getById(course_id, 'courses');
        const content = await Repository.getById(course.content_id, 'contents');
        const newStudent = await Repository.create(
            new StudentRegisterRequest({
                user_id: user_id,
                course_id: course_id,
                image: course.image,
                course_name: course.name,
                content: new ContentRegisterRequest(content),
                totalModules: content.modules?.length || 0,
                totalCost: course.cost,
                modulesCompleted: 0,
                costCompleted: 0,
                payments: [],
                documents: []
            }),
            repositoryName
        );
        res.status(201).json({
            id: newStudent.id,
            user_id: newStudent.user_id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/courses', async (req, res) => {
    try {
        const userId = req.query.user_id;
        const entities = await QueryRepository.getCoursesByUserId(userId);
        res.status(200).json(entities.map(entity => ({
            course_id: entity.course_id,
            course_name: entity.course_name,
            id: entity.id,
            image: entity.image
        })));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

module.exports = router;
