const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

router.get('/:id', (req, res) => {
    res.status(200).json({
        id: 'U_2605_SEC_2605',
        user_id: 'U_2605',
        course_id: 'SEC_2605',
        course_name: 'Secundaria',
        date_init: '2026-05-01',
        date_end: '2027-05-01',
        percentage: 50,
        total_payments: 10,
        paid_payments: 5,
        status: 'curso',
        history: [{
            module: 'Modulo 1',
            topic: 'Algebra I',
            date: '2026-05-01'
        }],
        test: [{
            module: 'Modulo 1',
            date: '2026-05-01',
            grading: 80,
            status: 'aprobado',
            attempt: 2
        }],
        payments: [{
            date: '2026-05-01',
            amount: 1500,
            type: 'inscripcion',
            image: "https://image.jpg"
        }, {
            date: '2026-06-01',
            amount: 1000,
            type: 'mensualidad',
            image: "https://image.jpg"
        }]
    });
});

router.post(
    '/',
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'ine', maxCount: 1 }
    ]),
    (req, res) => {
        const { name, curp, phone, email, course_id, adviser_id } = req.body;
        res.status(201).json({
            message: 'Student registered successfully'
        });
    }
);


module.exports = router;
