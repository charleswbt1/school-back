const express = require('express');
const router = express.Router();
const authenticateToken = require('../config/auth-middleware.js');
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const TrainingCourseDto = require('../dto/training-course-dto.js');

const repositoryName = 'training-courses';

router.post('', authenticateToken, async (req, res) => {
    try {
        const request = new TrainingCourseDto(req.body);
        const squad = await Repository.getById(request.squad_id, 'squads');
        request.image = squad.logo;

        request.cost_market.inscription = request.cost.inscription + 500;
        request.cost_market.quota = request.cost.quota + 1000;
        request.cost_market.reinscription = request.cost.reinscription + 1000;
        request.cost_market.title = request.cost.title + 10000;
        request.cost_market.title_two = request.cost.title_two + 10000;

        const period = await getPeriod(request.coordinator_id, request.date_init);
        request.period_id = period;
        const entity = await Repository.create(request, repositoryName, { user: req.user });

        period.courses.push({
            course_id: entity.id,
            name: entity.name
        });
        await Repository.update(period.id, period, 'training-periods');

        res.status(201).json(Utils.formatDates(entity));
    } catch (error) {
        console.error(`training-courses post: ${error}`);
        res.status(409).json({ message: error.message });
    }
});
router.get('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const state = req.query.state;
        const periodId = req.query.period_id;
        const coordinatorId = req.query.coordinator_id;
        const teacherId = req.query.teacher_id;
        const available = req.query.available;
        const adviserId = req.query.adviser_id;

        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            const filters = [];
            if (available) {
                const today = new Date().toISOString().split('T')[0];
                filters.push(['state', '==', 'active']);
                filters.push(['date_init', '>=', today]);
                entities = await Repository.query(repositoryName, filters);
                if (coordinatorId) {
                    entities = entities.filter(entity => entity.coordinator_id === coordinatorId);
                }
                if (adviserId) {
                    entities = entities.filter(entity => entity.adviser_id === adviserId);
                }
            } else {
                if (state) {
                    filters.push(['state', '==', state]);
                }
                if (coordinatorId) {
                    filters.push(['coordinator_id', '==', coordinatorId]);
                }
                if (adviserId) {
                    filters.push(['adviser_id', '==', adviserId]);
                }
                if (periodId) {
                    filters.push(['period_id', '==', periodId]);
                }
                if (teacherId) {
                    filters.push(['teacher_id', '==', teacherId]);
                    filters.push(['state', '==', 'active']);
                }
                entities = await Repository.query(repositoryName, filters);
            }
        }
        res.status(200).json(entities.map(Utils.formatDates));
    } catch (error) {
        console.error(`training-courses get: ${error}`);
        res.status(412).json({ message: error.message });
    }
});
router.patch('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const entity = await Repository.update(id, req.body, repositoryName, { user: req.user });
        if (req.body.squad_id != entity.squad_id) {
            const squad = await Repository.getById(req.body.squad_id, 'squads');
            req.body.image = squad.logo;
            await Repository.update(id, req.body, repositoryName);
        }
        if (req.body.name != entity.name) {
            const period = await Repository.getById(entity.period_id, 'training-periods');
            const courseIndex = period.courses.findIndex(course => course.course_id === entity.id);
            if (courseIndex !== -1) {
                period.courses[courseIndex].name = req.body.name;
                await Repository.update(period.id, period, 'training-periods');
            }
        }
        if (req.body.date_init != entity.date_init) {
            const period = await Repository.getById(entity.period_id, 'training-periods');
            period.courses = period.courses.filter(course => course.course_id !== entity.id);
            await Repository.update(period.id, period, 'training-periods');

            const newPeriod = await getPeriod(entity.coordinator_id, req.body.date_init);
            newPeriod.courses.push({
                course_id: entity.id,
                name: req.body.name || entity.name
            });
            await Repository.update(newPeriod.id, newPeriod, 'training-periods');
        }
        res.status(200).json(Utils.formatDates(entity));
    } catch (error) {
        console.error(`training-courses patch: ${error}`);
        res.status(412).json({ message: error.message });
    }
});

router.get('/review', async (req, res) => {
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
        console.error(`training-courses review: ${error}`);
        res.status(412).json({
            message: error.message
        });
    }
});
router.get('/periods', async (req, res) => {
    try {
        const coordinatorId = req.query.coordinator_id;
        const filters = [];
        if (coordinatorId) {
            filters.push(['coordinator_id', '==', coordinatorId]);
        }
        const entities = await Repository.query('training-periods', filters);
        res.status(200).json(entities.map(Utils.formatDates));
    } catch (error) {
        console.error(`training-courses periods: ${error}`);
        res.status(412).json({ message: error.message });
    }
});
router.get('/student', async (req, res) => {
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
        console.error(`training-courses student: ${error}`);
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
        console.error(`training-courses teachers: ${error}`);
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
        console.error(`training-courses change: ${error}`);
        res.status(412).json({ message: error.message });
    }
});

async function getPeriod(coordinatorId, dateInit) {
    const toDay = new Date(dateInit);
    const month = toDay.toLocaleString('es-MX', { month: 'long' }).toUpperCase();
    const year = toDay.getFullYear().toString();

    const periods = await Repository.query(
        'training-periods',
        [
            ['coordinator_id', '==', coordinatorId],
            ['month', '==', month],
            ['year', '==', year]
        ]
    );
    if (periods.length > 0) {
        return periods[0];
    } else {
        const period = {
            coordinator_id: coordinatorId,
            month: month,
            year: year,
            courses: []
        };
        const newPeriod = await Repository.create(period, 'training-periods');
        return newPeriod;
    }
}

module.exports = router;
