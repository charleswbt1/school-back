const express = require('express');
const router = express.Router();
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const CourseDto = require('../dto/course-dto.js');

const repositoryName = 'courses';

router.post('', async (req, res) => {
    try {
        const request = new CourseDto(req.body);
        if (!request.coordinator_id || !request.teacher_id || !request.content_id || !request.name || !request.date_init) {
            throw new Error('Faltan datos obligatorios');
        }
        const toDay = new Date(request.date_init);
        const month = toDay.toLocaleString('es-MX', { month: 'long' }).toUpperCase();
        const year = toDay.getFullYear();
        request.month = month;
        request.year = `${year}`;
        request.cost_inscription = request.offer_cost_inscription + 500;
        request.cost_quota = request.offer_cost_quota + 1000;
        request.cost_reinscription = request.offer_cost_reinscription + 1000;
        request.cost_title = request.offer_cost_title + 10000;

        const periods = await Repository.query(
            'periods',
            [
                ['coordinator_id', '==', request.coordinator_id],
                ['year', '==', year],
                ['month', '==', month]
            ]
        );
        const entity = await Repository.create(request, repositoryName);

        if (periods.length > 0) {
            const period = periods[0];
            period.courses.push(request.name);
            await Repository.update(period.id, period, 'periods');
        } else {
            const newPeriod = {
                coordinator_id: request.coordinator_id,
                month: month,
                year: year,
                courses: [request.name],
                coursesId: [entity.id]
            }
            await Repository.create(newPeriod, 'periods');
        }
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
        const teacherId = req.query.teacher_id;
        const available = req.query.available;

        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            const filters = [];
            if (state) {
                filters.push(['state', '==', state]);
            }
            if (coordinatorId) {
                filters.push(['coordinator_id', '==', coordinatorId]);
            }
            if (year && month) {
                filters.push(['year', '==', year]);
                filters.push(['month', '==', month]);
            }
            if (teacherId) {
                filters.push(['teacher_id', '==', teacherId]);
                filters.push(['state', '==', 'active']);
            }
            if (available) {
                const today = new Date().toISOString().split('T')[0];
                filters.push(['state', '==', 'active']);
                filters.push(['date_init', '>=', today]);
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

router.get('/periods', async (req, res) => {
    try {
        const coordinatorId = req.query.coordinator_id;
        const filters = [];
        if (coordinatorId) {
            filters.push(['coordinator_id', '==', coordinatorId]);
        }
        const entities = await Repository.query('periods', filters);
        res.status(200).json(entities.map(Utils.formatDates));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});
router.get('/student', async (req, res) => {
    try {
        const studentId = req.query.student_id;
        const student = await Repository.getById(studentId, 'students');
        const course = await Repository.getById(student.course_id, 'courses');
        const content = await Repository.getById(course.content_id, 'contents');
        res.status(200).json({
            student: student,
            course: course,
            content: content
        });
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});
router.get('/teachers', async (req, res) => {
    try {
        const teachers = await Repository.query('users', [['role', '==', 'teacher']]);
        const today = new Date().toISOString().split('T')[0];
        const courses = await Repository.query(
            'courses', [
            ['state', '==', 'active'],
            ['date_init', '<', today]
        ]
        );
        const response = teachers.map(teacher => {
            const teacherCourses = courses.filter(course => course.teacher_id === teacher.id);
            return {
                ...teacher,
                courses: teacherCourses
            };
        });
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});
router.patch('/change', async (req, res) => {
    try {
        const courseOriginId = req.query.course_origin_id;
        const courseDestinationId = req.query.course_destination_id;
        const entity = await Repository.query('students', [['course_id', '==', courseOriginId]]);
        for (const student of entity) {
            student.course_id = courseDestinationId;
            await Repository.update(student.id, student, 'students');
        }
        await Repository.update(courseOriginId, { state: 'inactive' }, 'courses');
        res.status(200).json({
            message: 'Estudiantes transferidos correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

module.exports = router;
