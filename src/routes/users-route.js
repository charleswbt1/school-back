const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const csv = require("csv-parser");
const { Readable } = require("stream");
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const UserDto = require('../dto/user-dto.js');
const StudentDto = require('../dto/student-dto.js');

const repositoryName = 'users';

router.post('', async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
        const request = new UserDto(req.body);

        const nickName = await Repository.validUnique('nick_name', request.nick_name);
        if (!nickName.valid) {
            throw new Error(nickName.message);
        }

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
        const state = req.query.state;
        const role = req.query.role;
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            const filters = [];
            if (state) {
                filters.push(['state', '==', state]);
            }
            if (role) {
                filters.push(['role', '==', role]);
            }
            entities = await Repository.query(repositoryName, filters);
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
        const entity = await Repository.update(id, req.body, repositoryName);
        res.status(200).json(Utils.formatDates(entity));
    } catch (error) {
        console.error(error);
        res.status(412).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { nick_name, password } = req.body;
    try {
        const query = await Repository.query(
            'users',
            [
                ['nick_name', '==', nick_name]
            ]
        );
        if (!query) {
            res.status(401).json({ message: 'user not found' });
        }
        const user = query[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (user && validPassword) {
            res.status(200).json({ role: user.role, user_id: user.id, team_id: user.team_id });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/password', async (req, res) => {
    const { user_id, new_password } = req.body;
    try {
        const pass = await bcrypt.hash(req.body.new_password, 10);
        const user = await Repository.getById(user_id, repositoryName);
        user.password = pass;
        await Repository.update(user_id, user, repositoryName);

        res.status(200).json({ role: user.role, user_id: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post("/import/students", upload.single("reqFile"), async (req, res) => {
    try {
        const rows = [];
        const course = await Repository.getById(req.body.course_id, "courses");
        const content = await Repository.getById(course.content_id, "contents");

        Readable
            .from(req.file.buffer)
            .pipe(csv())
            .on("data", row => rows.push(row))
            .on("end", async () => {
                let created = 0;
                const errors = [];

                for (const [index, row] of rows.entries()) {
                    try {
                        const exists = await Repository.query("usersTest", [["curp", "==", row.curp]]);
                        if (exists.length) {
                            errors.push({
                                row: index + 2,
                                error: "CURP ya registrada"
                            });
                            continue;
                        }
                        const nickName = generateNickName(row.firstName, row.lastName, row.secondLastName, row.curp);
                        const user = await Repository.create(
                            new UserDto({
                                nick_name: nickName,
                                password: await bcrypt.hash(nickName, 10),
                                role: "student",
                                first_name: row.firstName,
                                last_name: row.lastName,
                                second_last_name: row.secondLastName,
                                curp: row.curp,
                                phone: row.phone,
                                email: row.email,
                                image: "",
                                state: "active",
                                team_id: req.body.team_id
                            }),
                            "usersTest"
                        );

                        await Repository.create(
                            new StudentDto({
                                school_id: "",
                                user_id: user.id,
                                course_id: course.id,
                                adviser_id: course.adviser_id,
                                coordinator_id: course.coordinator_id,
                                image: course.image,
                                course_name: course.name,
                                total_modules: content.modules.length,
                                total_cost: course.cost,
                                modules_completed: 0,
                                cost_completed: 0,
                                average: 0,
                                payments: [],
                                documents: [],
                                notes: [],
                                progresses: []
                            }),
                            "studentsTest"
                        );
                        created++;
                    } catch (error) {
                        console.error(error);
                        errors.push({
                            row: index + 2,
                            error: error.message
                        });
                    }
                }
                res.json({
                    total: rows.length,
                    created,
                    errors
                });
            });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
function generateNickName(firstName, lastName, secondLastName, curp) {
    const names = firstName.trim().toLowerCase().split(/\s+/);
    let nick = names[0];

    if (names.length > 1) {
        nick += names[1][0];
    }

    if (lastName) {
        nick += lastName.trim()[0].toLowerCase();
    }
    if (secondLastName) {
        nick += secondLastName.trim()[0].toLowerCase();
    }
    if (curp && curp.length >= 6) {
        nick += curp.substring(4, 6);
    }
    return nick;
}

module.exports = router;