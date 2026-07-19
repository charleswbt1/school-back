const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const UserDto = require('../dto/user-dto.js');

const repositoryName = 'users';

router.post('', async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
        const request = new UserDto(req.body);

        const nickName = await Repository.validUnique('nick_name', request.nick_name);
        if (!nickName.valid) {
            throw new Error(nickName.message);
        }

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
        const role = req.query.role;
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            const filters = [];
            if (state) {
                filters.push(['state', '==', state]);
            }
            if (role) {
                filters.push(['role', '==', role]);
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

router.post('/login', async (req, res) => {
    const { nick_name, password } = req.body;
    try {
        const query = await Repository.query(
            'users',
            [
                ['nick_name', '==', nick_name]
            ]
        );
        if (!query) {
            res.status(401).json({ message: 'user not found' });
        }
        const user = query[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (user && validPassword) {
            res.status(200).json({ role: user.role, user_id: user.id, team_id: user.team_id });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/password', async (req, res) => {
    const { user_id, new_password } = req.body;
    try {
        const pass = await bcrypt.hash(req.body.new_password, 10);
        const user = await Repository.getById(user_id, repositoryName);
        user.password = pass;
        await Repository.update(user_id, user, repositoryName);

        res.status(200).json({ role: user.role, user_id: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/fix', async (req, res) => {
    try {
        const users = await Repository.query('users');
        for (const user of users) {
            user.team_id = 'TEA_1784414333872';
            await Repository.update(user.id, user, 'users');
        }
        res.json({
            message: 'Usuarios actualizados correctamente',
            total: users.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
