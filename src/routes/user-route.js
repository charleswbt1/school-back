const express = require('express');
const router = express.Router();
const UserRepository = require('../repositories/repository.js');

router.get('/all', async (req, res) => {
    let result = await UserRepository.getAllUsers();
    res.status(200).json(result);
});

router.post('/login', async (req, res) => {
    const { nickname, password } = req.body;
    try {
        /*
        const users = await UserRepository.getAllUsers();
        const user = users.find(u => u.nickname === nickname && u.password === password);

        if (user) {
            res.status(200).json({ message: 'Login successful', role: user.role, studentId: user.id });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });    
        }*/

        if (nickname === 's')
            res.status(200).json({ role: 'student', studentId: 'S_2605' });
        else
            res.status(200).json({ role: 'adviser', adviserId: 'S_2605' });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
