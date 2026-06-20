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
        const state = req.query.state;
        const courseId = req.query.course_id;
        var entities;

        if (courseId) {
            entities = await QueryRepository.getStudentsByCourseId(courseId);
        } else if (id) {
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
    const { user_id, course_id, adviser_id } = req.body;
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
        content.modules.forEach(module => {
            module.qualification = null;
        });
        const newStudent = await Repository.create(
            new StudentRegisterRequest({
                user_id: user_id,
                course_id: course_id,
                adviser_id: adviser_id || course.adviser_id,
                image: course.image,
                course_name: course.name,
                content: new ContentRegisterRequest(content),
                total_modules: content.modules?.length || 0,
                total_cost: course.cost,
                monthly_payment: course.monthly_payment,
                modules_completed: 0,
                cost_completed: 0,
                average: 0,
                payments: [],
                documents: [],
                state: 'pendiente'
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
router.get('/data', async (req, res) => {
    try {
        const adviserId = req.query.adviser_id;
        let entities = [];
        if (adviserId) {
            entities = await QueryRepository.getStudentsByAdviserId(adviserId);
        } else {
            entities = await Repository.getAll('students');
        }
        const response = await Promise.all(
            entities.map(async entity => {
                const user = await Repository.getById(entity.user_id, 'users');
                return {
                    id: entity.id,
                    curp: user?.curp,
                    name: user?.first_name + ' ' + user?.last_name + ' ' + user?.second_last_name,
                    course_name: entity.course_name,
                    phone: user?.phone,
                    state: user?.state
                };
            }
            ));
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});
router.post('/bill', async (req, res) => {
    const { url, amount, student_id, year, month, source } = req.body;
    try {
        if (amount <= 0) {
            return res.status(400).json({ message: 'Monto no válido' });
        }
        const student = await Repository.getById(student_id, repositoryName);
        if (!student) {
            return res.status(409).json({ message: 'No se encontró al estudiante' });
        }
        student.payments.push({
            amount,
            source: source,
            date: new Date(),
            year: `${year}`,
            month: month,
            url
        });
        student.costCompleted = parseFloat(student.costCompleted) + parseFloat(amount);
        const updatedStudent = await Repository.update(student_id, student, repositoryName);
        res.status(200).json({
            message: "Registro de pago exitoso"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/qualification', async (req, res) => {
    const { module_name, qualification, student_id } = req.body;
    try {
        if (qualification <= 0 || qualification > 10) {
            return res.status(400).json({ message: 'Calificación no válida' });
        }
        const student = await Repository.getById(student_id, repositoryName);
        if (!student) {
            return res.status(409).json({ message: 'No se encontró al estudiante' });
        }
        student.content.modules.find(module => module.name === module_name).qualification = qualification;
        student.average = student.content.modules.reduce((sum, module) => sum + (module.qualification || 0), 0) / student.content.modules.length;

        const updatedStudent = await Repository.update(student_id, student, repositoryName);
        res.status(200).json({
            message: "Registro de calificación exitoso"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/control', async (req, res) => {
    try {
        const courseId = req.query.course_id;
        const course = await Repository.getById(courseId, 'courses');
        var entities = await QueryRepository.getStudentsByCourseId(courseId);

        const students = await Promise.all(
            entities.map(async entity => {
                const user = await Repository.getById(entity.user_id, 'users');
                return {
                    id: entity.id,
                    curp: user?.curp,
                    name: user?.first_name + ' ' + user?.last_name + ' ' + user?.second_last_name,
                    phone: user?.phone,
                    state: user?.state,
                    payments: user?.payments || [],
                    documents: user?.documents || []
                };
            }
            ));
        const response = {
            course_name: course.name,
            date_init: course.date_init,
            date_end: course.date_end,
            students: students
        }
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

module.exports = router;
