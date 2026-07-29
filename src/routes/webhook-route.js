const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const Repository = require('../repositories/repository.js');

router.post('/stripe', async (req, res) => {
    try {
        console.log(`webhook stripe ${JSON.stringify(req.body)}`);
        const event = req.body;
        if (
            event.type === "checkout.session.completed" &&
            event.data.object.payment_status === "paid"
        ) {
            const payments = await Repository.query('payments', [
                ['stripe_id', '==', event.data.object.id],
                ['state', '==', 'active']
            ]);
            if (payments.length > 0) {
                const payment = payments[0];
                const students = await Repository.query('students', [
                    ['id', '==', payment.student_id]
                ]);
                const student = students[0];
                student.payments.push({
                    id: `PAY_${Date.now()}`,
                    amount: payment.amount,
                    type: payment.type,
                    source: 'stripe',
                    date: new Date(),
                    year: `${payment.year}`,
                    month: `${payment.month}`,
                    url: 'https://storage.googleapis.com/school-source/web/stripe.jpg'
                });

                if (student.state === 'pending') {
                    console.log(`webhook validate state ${payment.student_id}`);
                    const totalPaid = student.payments.filter(p =>
                        p.year === payment.year && p.month === payment.month
                    ).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                    const course = await Repository.getById(student.course_id, 'courses');
                    const total = course.offer_cost_inscription + course.offer_cost_quota;
                    if (totalPaid >= total) {
                        student.state = 'active';
                    }
                }
                payment.state = 'validated';
                await Repository.update(payment.id, payment, 'payments')
                await Repository.update(payment.student_id, student, 'students');
            }
        }
        res.status(200).json({ message: 'sucess' });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/fix', async (req, res) => {
    try {
        const courses = await Repository.query('courses');
        for (const course of courses) {
            course.model = 'sync';
            await Repository.update(course.id, course, 'courses');
        }
        res.json({
            message: 'Registros actualizados',
            total: courses.length
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;