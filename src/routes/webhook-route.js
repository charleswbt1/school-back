const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');

router.post('/stripe', async (req, res) => {
    try {
        console.log(`webhook stripe ${JSON.stringify(req.body)}`);
        res.status(200).json({ message: 'sucess' });
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;