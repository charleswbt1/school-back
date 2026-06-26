const express = require('express');
const router = express.Router();
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const ContentRegisterRequest = require('../dto/content-dto.js');

const repositoryName = 'contents';

router.post('', async (req, res) => {
    try {
        const request = new ContentRegisterRequest(req.body);
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
        } else {
            const filters = [];
            if (state) {
                filters.push(['state', '==', state]);
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

module.exports = router;
