const express = require('express');
const router = express.Router();
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const SquadRegisterRequest = require('../dto/squad-dto.js');

const repositoryName = 'squads';

router.post('', async (req, res) => {
    try {
        const request = new SquadRegisterRequest(req.body);
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
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        }
        else {
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
        const request = new SquadRegisterRequest(req.body);
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

module.exports = router;
