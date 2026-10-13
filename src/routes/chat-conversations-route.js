const express = require('express');
const router = express.Router();
const authenticateToken = require('../config/auth-middleware.js');
const Repository = require('../repositories/repository.js');
const ChatConversationDto = require('../dto/chat-conversation-dto.js');
const repositoryName = 'chat-conversations';

router.post('', authenticateToken, async (req, res) => {
    try {
        const request = new ChatConversationDto(req.body);
        request.participant_ids = [
            ...new Set([
                ...(request.participant_ids || []),
                req.user.id
            ])
        ];
        const entity = await Repository.create(request, repositoryName, { user: req.user });
        res.status(201).json(Repository.formatDates(entity));
    } catch (error) {
        console.error(`chat conversation error: ${error}`);
        res.status(409).json({ message: error.message });
    }
});

router.get('', authenticateToken, async (req, res) => {
    try {
        const courseId = req.query.course_id;
        const type = req.query.type;

        const filters = [];
        filters.push(['participant_ids', 'array-contains', req.user.id]);

        if (courseId) {
            filters.push(['course_id', '==', courseId]);
        }
        if (type) {
            filters.push(['type', '==', type]);
        }

        const entities = await Repository.query(repositoryName, filters,
            { field: 'updatedAt', direction: 'desc' }
        );
        res.status(200).json(
            entities.map(entity => Repository.formatDates(entity))
        );
    } catch (error) {
        console.error(`chat conversation error: ${error}`);
        res.status(412).json({ message: error.message });
    }
});

module.exports = router;