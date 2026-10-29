const express = require('express');
const router = express.Router();
const authenticateToken = require('../config/auth-middleware.js');
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const CourseDto = require('../dto/course-dto.js');

const repositoryName = 'courses';

router.post('', authenticateToken, async (req, res) => {
    try {
        const request = new CourseDto(req.body);
        if (req.user.role === 'coordinator') {
            request.coordinator_id = req.user.id;
        }
        if (!request.coordinator_id || !request.teacher_id || !request.content_id || !request.name || !request.date_init) {
            throw new Error('Faltan datos obligatorios');
        }
        const squad = await Repository.getById(request.squad_id, 'squads');
        request.image = squad.logo;

        const toDay = new Date(request.date_init);
        const month = toDay.toLocaleString('es-MX', { month: 'long' }).toUpperCase();
        const year = toDay.getFullYear();
        request.month = month;
        request.year = `${year}`;
        request.cost_inscription = request.offer_cost_inscription + 500;
        request.cost_quota = request.offer_cost_quota + 1000;
        request.cost_reinscription = request.offer_cost_reinscription + 1000;
        request.cost_title = request.offer_cost_title + 10000;
        request.cost_title_two = request.offer_cost_title_two + 10000;
        const entity = await Repository.create(request, repositoryName);
        res.status(201).json(Utils.formatDates(entity));
    } catch (error) {
        console.error(error);
        res.status(409).json({ message: error.message });
    }
});
router.get('', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const filters = [];
        var entities = [];
        switch (role) {
            case 'counter':
                filters.push(['state', '==', 'active']);
                entities = await Repository.query(repositoryName, filters);
                break;
            case 'coordinator':
                filters.push(['coordinator_id', '==', userId]);
                entities = await Repository.query(repositoryName, filters);
                break;
            case 'teacher':
                filters.push(['teacher_id', '==', userId]);
                filters.push(['state', '==', 'active']);
                entities = await Repository.query(repositoryName, filters);
                break;
            case 'adviser':
                const today = new Date().toISOString().split('T')[0];
                filters.push(['state', '==', 'active']);
                filters.push(['date_init', '>=', today]);
                entities = await Repository.query(repositoryName, filters);
                entities = entities.filter(entity => entity.adviser_id === userId);
                break;
        }
        entities.sort((a, b) => {
            const teamComparison = String(a.team_id).localeCompare(String(b.team_id));
            if (teamComparison !== 0) {
                return teamComparison;
            }
            const coordinatorComparison = String(a.coordinator_id).localeCompare(String(b.coordinator_id));
            if (coordinatorComparison !== 0) {
                return coordinatorComparison;
            }
            return new Date(a.date_init) - new Date(b.date_init);
        });
        res.status(200).json(entities);
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});
router.patch('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const squad = await Repository.getById(req.body.squad_id, 'squads');
        req.body.image = squad.logo;
        const entity = await Repository.update(id, req.body, repositoryName);
        res.status(200).json(Utils.formatDates(entity));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

router.get('/availables', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const filters = [
            ['state', '==', 'active'],
            ['date_init', '>=', today]
        ];
        const entities = await Repository.query(repositoryName, filters);
        res.status(200).json(entities.map(Utils.formatDates));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});
router.get('/detail', async (req, res) => {
    try {
        const id = req.query.id;
        const course = await Repository.getById(id, 'courses');
        const content = await Repository.getById(course.content_id, 'contents');
        const adviser = await Repository.getById(course.adviser_id, 'users');

        res.status(200).json({
            modules: content.modules,
            adviser: adviser
        });
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

router.get('/review', authenticateToken, async (req, res) => {
    try {
        const { year, month, team } = req.query;
        const coordinators = await Repository.query('users', [
            ['role', '==', 'coordinator'],
            ['team_id', '==', team]
        ]);
        const review = await Promise.all(
            coordinators.map(async coordinator => {
                const courses = await Repository.query(repositoryName, [
                    ['coordinator_id', '==', coordinator.id]
                ]);
                const students = await Repository.query('students', [
                    ['coordinator_id', '==', coordinator.id]
                ]);
                const courseReview = courses.map(course => {
                    let paymentStudents = 0;
                    let titlePaymentStudents = 0;
                    const courseStudents = students.filter(student => student.course_id === course.id);
                    const amount = courseStudents.reduce((sum, student) => {
                        const total = (student.payments || [])
                            .filter(payment =>
                                payment.year == year &&
                                payment.month == month &&
                                payment.type === 'cuota'
                            )
                            .reduce((s, payment) => s + (Number(payment.amount) || 0), 0);
                        if (total > 0) {
                            paymentStudents++;
                        }
                        return sum + total;
                    }, 0);

                    const titleAmount = courseStudents.reduce((sum, student) => {
                        const total = (student.payments || [])
                            .filter(payment => payment.type === 'titulo')
                            .reduce((s, payment) => s + (Number(payment.amount) || 0), 0);
                        if (total > 0) {
                            titlePaymentStudents++;
                        }
                        return sum + total;
                    }, 0);
                    return {
                        course_name: course.name,
                        students: courseStudents.length,
                        paymentStudents,
                        amount,
                        titlePaymentStudents,
                        titleAmount,
                        year: course.year,
                        month: course.month
                    };
                });
                return {
                    coordinator_name: `${coordinator.first_name} ${coordinator.last_name} ${coordinator.second_last_name}`,
                    courses: courseReview.filter(
                        course => course.amount > 0 || course.titleAmount > 0
                    )
                };
            })
        );
        res.status(200).json(review);
    } catch (error) {
        console.error(error);
        res.status(412).json({
            message: error.message
        });
    }
});
router.get('/student', authenticateToken, async (req, res) => {
    try {
        const studentId = req.query.student_id;
        const student = await Repository.getById(studentId, 'students');
        const course = await Repository.getById(student.course_id, 'courses');
        const content = await Repository.getById(course.content_id, 'contents');
        const user = await Repository.getById(student.user_id, 'users');

        const payTotal = student.payments.reduce((total, payment) => total += Number(payment.amount), 0);
        const availableModules = Math.max(0, Math.floor((payTotal - 500) / 500));
        content.modules.forEach((module, index) => { module.available = index < availableModules; });

        res.status(200).json({
            student: student,
            course: course,
            content: content,
            name: `${user.first_name} ${user.last_name} ${user.second_last_name}`,
            email: user.email,
            phone: user.phone
        });
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

router.patch('/change', authenticateToken, async (req, res) => {
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
