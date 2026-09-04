const express = require('express');
const router = express.Router();
const Repository = require('../repositories/repository.js');
const ConversationDto = require('../dto/conversation-dto.js');
const repositoryName = 'conversations';

router.post('', async (req, res) => {
    try {
        const request = new ConversationDto(req.body);
        const entity = await Repository.create(request, repositoryName);
        res.status(201).json(Repository.formatDates(entity));
    } catch (error) {
        console.error(error);
        res.status(409).json({ message: error.message });
    }
});

router.get('', async (req, res) => {
    try {
        const id = req.query.id;
        const userId = req.query.user_id;
        const courseId = req.query.course_id;
        const type = req.query.type;
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            const filters = [];
            if (userId) {
                filters.push(['participant_ids', 'array-contains', userId]);
            }
            if (courseId) {
                filters.push(['course_id', '==', courseId]);
            }
            if (type) {
                filters.push(['type', '==', type]);
            }

            entities = await Repository.query(repositoryName, filters,
                { field: 'updatedAt', direction: 'desc' }
            );
        }
        res.status(200).json(
            entities.map(entity => Repository.formatDates(entity))
        );
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

router.patch('', async (req, res) => {
    try {
        const id = req.query.id;
        const entity = await Repository.update(
            id,
            new ConversationDto(req.body),
            repositoryName
        );
        res.status(200).json(Repository.formatDates(entity));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

module.exports = router;