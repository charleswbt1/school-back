const express = require('express');
const router = express.Router();
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const QueryRepository = require('../repositories/query-repository.js');
const CourseRegisterRequest = require('../dto/course-dto.js');
const ContentRegisterRequest = require('../dto/content-dto.js');

const repositoryName = 'courses';

router.post('', async (req, res) => {
    try {
        const request = new CourseRegisterRequest(req.body);
        const content = await Repository.getById(request.content_id, "contents");
        request.content = new ContentRegisterRequest(content);
        request.inscription_available = true;
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
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else if (state) {
            entities = await Repository.getByState(state, repositoryName);
        } else {
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
router.post('/multimedia', async (req, res) => {
    try {
        const { course_id, module_name, topic_name, url } = req.body;
        const course = await Repository.getById(course_id, repositoryName);
        const students = await QueryRepository.getStudentsByCourseId(course_id);

        if (topic) {
            course.content.modules.find(module => module.name === module_name).topics
                .find(topic => topic.name === topic_name).multimedia = url;
            await Repository.update(course_id, course, repositoryName);

            students.map(async (student) => {
                student.content.modules.find(module => module.name === module_name).topics
                    .find(topic => topic.name === topic_name).multimedia = url;
                await Repository.update(student.id, student, "students");
            });
        } else {
            course.content.modules.find(module => module.name === module_name).exam = url;
            await Repository.update(course_id, course, repositoryName);

            students.map(async (student) => {
                student.content.modules.find(module => module.name === module_name).exam = url;
                await Repository.update(student.id, student, "students");
            });
        }

        res.status(201).json(Utils.formatDates(course));
    } catch (error) {
        console.error(error);
        res.status(409).json({ message: error.message });
    }
});

module.exports = router;
