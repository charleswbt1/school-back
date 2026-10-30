const express = require('express');
const router = express.Router();
const authenticateToken = require('../config/auth-middleware.js');
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const ContentDto = require('../dto/content-dto.js');

const repositoryName = 'contents';

router.post('', authenticateToken, async (req, res) => {
    try {
        if (req.user.role != 'coordinator') {
            throw new Error(`${req.user.role} no tiene permiso`);
        }
        const request = new ContentDto(req.body);
        request.coordinator_id = req.user.id;
        const entity = await Repository.create(
            request, repositoryName, { user: req.user }
        );
        res.status(201).json(Utils.formatDates(entity));
    } catch (error) {
        console.error('contents post', error);
        res.status(409).json({ message: 'Fallo al registrar contenido' });
    }
});
router.get('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const state = req.query.state;
        const userId = req.user.id;
        const role = req.user.role;
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            const filters = [];
            if (state) {
                filters.push(['state', '==', state]);
            }
            if (role === 'coordinator') {
                filters.push(['coordinator_id', '==', userId]);
            }
            entities = await Repository.query(repositoryName, filters);
        }
        res.status(200).json(entities.map(Utils.formatDates));
    } catch (error) {
        console.error('contents get', error);
        res.status(412).json({ message: 'Fallo al consultar contenido' });
    }
});
router.patch('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const entity = await Repository.update(
            id, req.body, repositoryName, { user: req.user }
        );
        res.status(200).json(Utils.formatDates(entity));
    } catch (error) {
        console.error('contents patch', error);
        res.status(412).json({ message: 'Fallo al actualizar contenido' });
    }
});

module.exports = router;
