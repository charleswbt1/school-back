const express = require('express');
const router = express.Router();
const multer = require('multer');
const puppeteer = require("puppeteer");
const QRCode = require('qrcode');
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
router.post('/pdf', async (req, res) => {
    try {
        const { student_id, type } = req.body;
        const student = await Repository.getById(student_id, 'students');
        const user = await Repository.getById(student.user_id, 'users');
        const date = new Date();
        const dateText = date.toLocaleDateString('es-MX', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const studentId = student.school_id.replace('-', '') || student_id.replace('STU_', '');
        const curp = user.curp || 'N/A';
        const studentName = `${user.first_name} ${user.last_name} ${user.second_last_name}`;
        const courseName = student.course_name;

        let html = (await fs.readFile(path.join(__dirname, `../templates/${type}.html`), 'utf8'))
            .replace('{{name}}', studentName)
            .replaceAll('{{course}}', courseName)
            .replace('{{schoolId}}', studentId)
            .replace('{{date}}', dateText)
            .replace('{{curp}}', curp);
        if (type === 'credential') {
            const logo = await fs.readFile(path.join(__dirname, `../templates/logo.jpg`));
            const logoBase64 = `data:image/jpeg;base64,${logo.toString('base64')}`;
            const contentQr = `${studentId}\n${curp}\n${studentName}\n${courseName}`;
            const qr = await QRCode.toDataURL(contentQr);
            const perfilImage = user.image || 'https://storage.googleapis.com/school-source/web/perfil.jpg'
            html = html.replace('{{logo}}', logoBase64)
                .replace('{{qr}}', qr)
                .replace('{{perfilImage}}', perfilImage);
        }
        if (type === 'constancy') {
            const header = await fs.readFile(path.join(__dirname, `../templates/header.png`));
            const headerBase64 = `data:image/png;base64,${header.toString('base64')}`;
            const water = await fs.readFile(path.join(__dirname, `../templates/water.png`));
            const waterBase64 = `data:image/png;base64,${water.toString('base64')}`;
            const signature = await fs.readFile(path.join(__dirname, `../templates/signature.png`));
            const signatureBase64 = `data:image/png;base64,${signature.toString('base64')}`;
            const course = await Repository.getById(student.course_id, 'courses');
            html = html.replace('{{header}}', headerBase64)
                .replace('{{watermark}}', waterBase64)
                .replace('{{signature}}', signatureBase64)
                .replace('{{rvoe}}', course.rvoe)
                .replace('{{months}}', course.number_quota)
                .replace('{{date_init}}', course.date_init)
                .replace('{{date_end}}', course.date_end);

        }

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.waitForSelector('img');
        await page.evaluate(async () => {
            const images = Array.from(document.images);
            await Promise.all(images.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }));
        });

        const pdf = await page.pdf({
            format: 'A4',
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