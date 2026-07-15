const express = require('express');
const router = express.Router();
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const StudentDto = require('../dto/student-dto.js');

const repositoryName = 'students';

router.post('', async (req, res) => {
    const { user_id, course_id, adviser_id } = req.body;
    try {
        const student = await Repository.query(
            'students',
            [
                ['user_id', '==', user_id],
                ['course_id', '==', course_id]
            ]
        );
        if (student.length > 0) {
            return res.status(201).json({
                id: student[0].id,
                user_id: student[0].user_id
            });
        }
        const course = await Repository.getById(course_id, 'courses');
        const content = await Repository.getById(course.content_id, 'contents');
        const newStudent = await Repository.create(
            new StudentDto({
                school_id: '',
                user_id: user_id,
                course_id: course_id,
                adviser_id: adviser_id || course.adviser_id,
                coordinator_id: course.coordinator_id,
                image: course.image,
                course_name: course.name,
                total_modules: content.modules?.length || 0,
                total_cost: course.cost,
                monthly_payment: course.monthly_payment,
                modules_completed: 0,
                cost_completed: 0,
                average: 0,
                payments: [],
                documents: [],
                notes: [],
                progresses: [],
                state: 'pending'
            }),
            repositoryName,
            'pending'
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
router.get('', async (req, res) => {
    try {
        const id = req.query.id;
        const state = req.query.state;
        const courseId = req.query.course_id;
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            const filters = [];
            if (state) {
                filters.push(['state', '==', state]);
            }
            if (courseId) {
                filters.push(['course_id', '==', courseId]);
                filters.push(['state', '==', 'active']);
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

router.get('/courses', async (req, res) => {
    try {
        const userId = req.query.user_id;
        const entities = await Repository.query(
            'students',
            [
                ['user_id', '==', userId]
            ]
        );
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
        const coordinatorId = req.query.coordinator_id;
        const teacherId = req.query.teacher_id;
        const courseId = req.query.course_id;

        let modulesTotal = 0;
        let contentId = '';

        const filters = [];
        let entities = [];

        if (adviserId) {
            const today = new Date().toISOString().split('T')[0];
            const coursesAvaliables = await Repository.query('courses', [
                ['state', '==', 'active'],
                ['date_init', '>=', today]
            ]);
            const courses = coursesAvaliables.filter(course => course.adviser_id === adviserId);
            for (const course of courses) {
                const students = await Repository.query(repositoryName, [
                    ['course_id', '==', course.id]
                ]);
                entities.push(
                    ...students.map(student => ({
                        ...student,
                        date_init: course.date_init
                    }))
                );
            }
        }
        if (coordinatorId) {
            filters.push(['coordinator_id', '==', coordinatorId]);
            entities = await Repository.query(repositoryName, filters);
        }
        if (courseId) {
            filters.push(['course_id', '==', courseId]);
            filters.push(['state', '==', 'active']);

            const course = await Repository.getById(courseId, 'courses');
            const content = await Repository.getById(course.content_id, 'contents');
            modulesTotal = content.modules.length;
            contentId = course.content_id;
            entities = await Repository.query(repositoryName, filters);
        }

        const response = await Promise.all(
            entities.map(async entity => {
                const user = await Repository.getById(entity.user_id, 'users');
                return {
                    id: entity.id,
                    curp: user?.curp,
                    name: user?.first_name + ' ' + user?.last_name + ' ' + user?.second_last_name,
                    course_name: entity.course_name,
                    course_id: entity.course_id,
                    phone: user?.phone,
                    state: entity.state,
                    modulesTotal: modulesTotal,
                    notes: entity.notes,
                    content_id: contentId,
                    total_paid: entity.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
                    adviser_id: entity.adviser_id,
                    date_init: entity.date_init,
                    payments: entity.payments
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
    const { url, amount, student_id, year, month, type, source } = req.body;
    try {
        if (amount <= 0) {
            return res.status(400).json({ message: 'Monto no válido' });
        }
        const student = await Repository.getById(student_id, repositoryName);
        if (!student) {
            return res.status(409).json({ message: 'No se encontró al estudiante' });
        }
        student.payments.push({
            id: `PAY_${Date.now()}`,
            amount,
            type,
            source: source,
            date: new Date(),
            year: `${year}`,
            month: month,
            url
        });
        student.cost_completed = parseFloat(student.cost_completed) + parseFloat(amount);

        if (student.state === 'pending') {
            const totalPaid = student.payments.filter(payment =>
                payment.year === year && payment.month === month
            ).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
            const course = await Repository.getById(student.course_id, 'courses');
            const total = course.offer_cost_inscription + course.offer_cost_quota;
            if (totalPaid >= total) {
                student.state = 'active';
            }
        }

        const updatedStudent = await Repository.update(student_id, student, repositoryName);
        res.status(200).json({
            message: "Registro de pago exitoso"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/document', async (req, res) => {
    const { url, type, student_id } = req.body;
    try {
        const student = await Repository.getById(student_id, repositoryName);
        if (!student) {
            return res.status(409).json({ message: 'No se encontró al estudiante' });
        }
        student.documents.push({
            type,
            url
        });

        const updatedStudent = await Repository.update(student_id, student, repositoryName);
        res.status(200).json({
            message: `Registro de documento ${type} exitoso`
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/qualification', async (req, res) => {
    const { module_id, qualification, student_id, state } = req.body;
    try {
        if (qualification <= 0 || qualification > 10) {
            return res.status(400).json({ message: 'Calificación no válida' });
        }
        const student = await Repository.getById(student_id, repositoryName);
        if (!student) {
            return res.status(409).json({ message: 'No se encontró al estudiante' });
        }
        if (!student.notes) {
            student.notes = [];
        }
        const note = student.notes.find(note => note.module_id === module_id);
        if (note) {
            note.value = Number(qualification);
            note.state = state;
        } else {
            student.notes.push({
                module_id: module_id,
                value: Number(qualification),
                state: state
            })
        }
        student.average = student.notes.length > 0
            ? student.notes.reduce((sum, note) => sum + Number(note.value || 0), 0) / student.notes.length
            : 0;
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
        var entities = await Repository.query(
            'students',
            [
                ['course_id', '==', courseId]
            ]
        );

        const students = await Promise.all(
            entities.map(async entity => {
                const user = await Repository.getById(entity.user_id, 'users');
                return {
                    id: entity.id,
                    curp: user?.curp,
                    name: user?.first_name + ' ' + user?.last_name + ' ' + user?.second_last_name,
                    phone: user?.phone,
                    state: entity?.state,
                    school_id: entity.school_id,
                    adviser_id: entity.adviser_id,
                    payments: entity.payments || [],
                    documents: entity.documents || []
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
