const express = require('express');
const router = express.Router();
const multer = require('multer');
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
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

        const studentDocumentId = student.school_id.replace('-', '') || student_id.replace('STU_', '');
        const logo = await fs.readFile(path.join(__dirname, `../templates/logo.jpg`));
        const logoBase64 = `data:image/jpeg;base64,${logo.toString('base64')}`;
        const qr = await QRCode.toDataURL(studentDocumentId);
        const perfilImage = user.image || 'https://storage.googleapis.com/school-source/web/perfil.jpg'
        const html = (await fs.readFile(path.join(__dirname, `../templates/${type}.html`), 'utf8'))
            .replace('{{name}}', `${user.first_name} ${user.last_name} ${user.second_last_name}`)
            .replace('{{course}}', student.course_name)
            .replace('{{schoolId}}', studentDocumentId)
            .replace('{{date}}', dateText)
            .replace('{{logo}}', logoBase64)
            .replace('{{curp}}', user.curp)
            .replace('{{qr}}', qr)
            .replace('{{perfilImage}}', perfilImage);

        const browser = await puppeteer.launch({
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            ignoreHTTPSErrors: true
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