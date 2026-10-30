const express = require('express');
const router = express.Router();
const authenticateToken = require('../config/auth-middleware.js');
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const ExamDto = require('../dto/exam-dto.js');

const repositoryName = 'exams';

router.post('', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const request = new ExamDto(req.body);
        if (role === 'teacher') {
            request.teacher_id = userId;
        }
        if (role === 'coordinator') {
            request.coordinator_id = userId;
        }
        const entity = await Repository.create(
            request, repositoryName, { user: req.user }
        );
        res.status(201).json(Utils.formatDates(entity));
    } catch (error) {
        console.error('exams post', error);
        res.status(409).json({ message: 'Fallo el registro del examen' });
    }
});
router.get('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const state = req.query.state;
        const userId = req.user.id;
        const role = req.user.role;
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            const filters = [];
            if (state) {
                filters.push(['state', '==', state]);
            }
            if (role === 'teacher') {
                filters.push(['teacher_id', '==', userId]);
            }
            if (role === 'coordinator') {
                filters.push(['coordinator_id', '==', userId]);
            }
            entities = await Repository.query(repositoryName, filters);
        }
        res.status(200).json(entities.map(Utils.formatDates));
    } catch (error) {
        console.error('exams get', error);
        res.status(412).json({ message: 'Fallo al consultar examen' });
    }
});
router.patch('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const entity = await Repository.update(
            id, req.body, repositoryName, { user: req.user }
        );
        res.status(200).json(Utils.formatDates(entity));
    } catch (error) {
        console.error('exams patch', error);
        res.status(412).json({ message: 'Fallo al actualizar examen' });
    }
});
router.delete('', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        const result = await Repository.delete(
            id, repositoryName, { user: req.user }
        );
        res.status(200).json(result);
    } catch (error) {
        console.error('exams delete', error);
        res.status(412).json({ message: 'Fallo al borrar examen' });
    }
});

router.get('/questions', authenticateToken, async (req, res) => {
    try {
        const id = req.query.exam_id;
        const entity = await Repository.getById(id, repositoryName);
        const questions = entity.questions.map((question) => {
            const answers = question.answers.map((answer) => {
                return {
                    answer: answer.answer
                };
            }
            );
            return {
                question: question.question,
                answers: answers,
            };
        });
        res.status(200).json({
            id: id,
            name: entity.name,
            questions: questions,
            theme: entity.theme
        });
    } catch (error) {
        console.error('exams questions', error);
        res.status(412).json({ message: 'Fallo al obtener preguntas' });
    }
});
router.post('/evaluate', authenticateToken, async (req, res) => {
    try {
        const request = req.body;
        const exam = await Repository.getById(request.exam_id, repositoryName);
        if (!exam) {
            throw new Error('No se encontró el examen');
        }

        if (request.answers.length !== exam.questions.length) {
            return res.status(400).json({
                message: "Número de respuestas incorrecto"
            });
        }

        let score = 0;
        exam.questions.forEach((question, i) => {
            const correctIndex = question.answers.findIndex(a => a.is_correct);
            if (request.answers[i].selected === correctIndex) {
                score++;
            }
        });

        const average = Number(((score / exam.questions.length) * 10).toFixed(1));
        const approved = average >= 7;
        res.status(201).json({ score, average, approved });
    } catch (error) {
        console.error('exams evaluate', error);
        res.status(409).json({ message: 'Fallo al evaluar examen' });
    }
});

module.exports = router;
