const express = require('express');
const router = express.Router();
const multer = require('multer');
const puppeteer = require('puppeteer');
const { getBucket } = require('../config/firebase');
const Repository = require('../repositories/repository');
const upload = multer({ storage: multer.memoryStorage() });
const fs = require('fs').promises;
const path = require('path');

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
                const extension = file.mimetype.split('/')[1];
                path = `${directory}/${Date.now()}-${newName}.${extension}`;
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
router.post('/constancy', async (req, res) => {
    try {
        const { student_name, course_name, school_id } = req.body;
        const date = new Date();
        const dateText = date.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        let html = await fs.readFile(
            path.join(__dirname, '../templates/constancy.html'),
            'utf8'
        );

        html = html
            .replace('{{name}}', student_name)
            .replace('{{course}}', course_name)
            .replace('{{schoolId}}', school_id)
            .replace('{{date}}', dateText);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });
        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename=certificado.pdf'
        });
        res.status(201).send(pdf);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
});

module.exports = router;