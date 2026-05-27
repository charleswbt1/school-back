const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getBucket } = require('../config/firebase');
const Repository = require('../repositories/repository');
const repositoryName = 'students';

const upload = multer({ storage: multer.memoryStorage() });

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Repository.getById(id, repositoryName);
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post(
    '/',
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'ine', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const {
                name,
                curp,
                phone,
                email,
                course_id,
                adviser_id
            } = req.body;

            const bucket = getBucket();

            let photoUrl = null;
            let ineUrl = null;

            // PHOTO

            if (
                req.files &&
                req.files.photo
            ) {

                const photo =
                    req.files.photo[0];

                const photoFileName =
                    `students/photos/${Date.now()
                    }-${photo.originalname}`;

                const photoFile =
                    bucket.file(photoFileName);

                await photoFile.save(
                    photo.buffer,
                    {
                        metadata: {
                            contentType:
                                photo.mimetype
                        }
                    }
                );

                [photoUrl] =
                    await photoFile.getSignedUrl({
                        action: 'read',
                        expires:
                            '03-01-2500'
                    });
            }

            // INE

            if (
                req.files &&
                req.files.ine
            ) {

                const ine =
                    req.files.ine[0];

                const ineFileName =
                    `students/ines/${Date.now()
                    }-${ine.originalname}`;

                const ineFile =
                    bucket.file(ineFileName);

                await ineFile.save(
                    ine.buffer,
                    {
                        metadata: {
                            contentType:
                                ine.mimetype
                        }
                    }
                );

                [ineUrl] =
                    await ineFile.getSignedUrl({
                        action: 'read',
                        expires:
                            '03-01-2500'
                    });
            }

            const student = {
                name,
                curp,
                phone,
                email,
                course_id,
                adviser_id,
                photoUrl,
                ineUrl,
                createdAt: new Date()
            };

            const result =
                await Repository.create(
                    student,
                    repositoryName
                );

            res.status(201).json({
                message:
                    'Student registered successfully',
                data: result
            });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

module.exports = router;