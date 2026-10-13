const express = require('express');
const router = express.Router();
const authenticateToken = require('../config/auth-middleware.js');
const Repository = require('../repositories/repository.js');
const ChatMessageDto = require('../dto/chat-message-dto.js');
const repositoryName = 'chat-messages';

router.post('', authenticateToken, async (req, res) => {
    try {
        const request = new ChatMessageDto(req.body);
        request.sender_name = req.user.first_name;
        request.sender_id = req.user.id;
        const entity = await Repository.create(request, repositoryName);
        res.status(201).json(Repository.formatDates(entity));
    } catch (error) {
        console.error(error);
        res.status(409).json({ message: error.message });
    }
});

router.get('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const conversationId = req.query.conversation_id;
        const senderId = req.query.sender_id;
        var entities;

        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            const filters = [];
            if (conversationId) {
                filters.push(['conversation_id', '==', conversationId]);
            }
            if (senderId) {
                filters.push(['sender_id', '==', senderId]);
            }

            entities = await Repository.query(repositoryName, filters,
                {
                    field: 'createdAt',
                    direction: 'asc'
                }
            );
        }
        res.status(200).json(entities.map(entity => Repository.formatDates(entity)));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

router.patch('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const entity = await Repository.update(id, new ChatMessageDto(req.body), repositoryName);

        res.status(200).json(Repository.formatDates(entity));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

module.exports = router;