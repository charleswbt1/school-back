const express = require('express');
const router = express.Router();

router.get('/:id', (req, res) => {
    res.status(200).json({
        id: 'SEC_HID_2605',
        name: 'Secundaria',
        description: 'Secundaria description',
        modules: [{
            name: 'Módulo 1',
            exam: "",
            topics: [{
                name: 'Algebra I',
                description: 'Ecuaciones',
                multimedia: ""
            }]
        }, {
            name: 'Módulo 2',
            exam: "",
            topics: [{
                name: 'Algebra II',
                description: 'Derivadas',
                multimedia: ""
            }]
        }]
    });
});

module.exports = router;
