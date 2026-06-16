const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const QueryRepository = require('../repositories/query-repository.js');
const UserRegisterRequest = require('../dto/user-dto.js');

const repositoryName = 'users';

router.post('', async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
        const request = new UserRegisterRequest(req.body);

        const nickName = await QueryRepository.validUnique('nick_name', request.nick_name);
        if (!nickName.valid) {
            throw new Error(nickName.message);
        }
        const phone = await QueryRepository.validUnique('phone', request.phone);
        if (!phone.valid) {
            throw new Error(phone.message);
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
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else if (state) {
            entities = await Repository.getByState(state, repositoryName);
        } else {
            entities = await Repository.getAll(repositoryName);
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
        const request = new UserRegisterRequest(req.body);
        const entity = await Repository.update(id, request, repositoryName);
        res.status(200).json(Utils.formatDates(entity));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});
router.delete('', async (req, res) => {
    try {
        const id = req.query.id;
        const result = await Repository.delete(id, repositoryName);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { nick_name, password } = req.body;
    try {
        const user = await QueryRepository.getCredential(nick_name);
        const validPassword = await bcrypt.compare(password, user.password);
        if (user && validPassword) {
            res.status(200).json({ role: user.role, user_id: user.id });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/role', async (req, res) => {
    const role = req.query.role;
    try {
        const users = await QueryRepository.getUsersByRole(role);
        res.status(200).json(users.map(Utils.formatDates));
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

module.exports = router;
