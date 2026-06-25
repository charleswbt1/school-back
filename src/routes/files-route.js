const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getBucket } = require('../config/firebase');
const Repository = require('../repositories/repository');
const upload = multer({ storage: multer.memoryStorage() });

router.post(
    '/',
    upload.fields([
        { name: 'reqFile', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { directory } = req.body;
            const bucket = getBucket();
            let path = null;
            if (
                req.files &&
                req.files.reqFile
            ) {
                let newName = 'doc';
                if (`${directory}`.includes('payment')) {
                    newName = 'payment';
                }
                const file = req.files.reqFile[0];
                path = `${directory}/${Date.now()}-${newName}`;
                const refBucket = bucket.file(path);

                await refBucket.save(
                    file.buffer,
                    {
                        metadata: {
                            contentType: file.mimetype
                        }
                    }
                );
            }
            res.status(201).json({ url: `https://storage.googleapis.com/${bucket.name}/${path}` });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

module.exports = router;