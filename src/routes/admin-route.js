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

router.get('/student/:id', (req, res) => {
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
        modules: [{
            name: 'Módulo 1',
            exam: "",
            topics: [{
                name: 'Algebra I',
                description: 'Ecuaciones',
                multimedia: "",
                state: 'aprobado'
            }]
        }, {
            name: 'Módulo 2',
            exam: "",
            topics: [{
                name: 'Algebra II',
                description: 'Derivadas',
                multimedia: ""
            }]
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


module.exports = router;
