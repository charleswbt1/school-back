const express = require('express');
const router = express.Router();

router.get('/course/:id', (req, res) => {
    res.status(200).json([{
        id: 'U_2605_SEC_2605',
        course_name: 'Secundaria',
        date_init: '2026-05-01',
        percentage: 50,
        status: 'curso'
    }]);
});

module.exports = router;