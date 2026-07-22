const express = require('express');
const router = express.Router();
const Utils = require('../config/utils.js');
const Repository = require('../repositories/repository.js');
const ExamDto = require('../dto/exam-dto.js');

const repositoryName = 'exams';

router.post('', async (req, res) => {
    try {
        const request = new ExamDto(req.body);
        const entity = await Repository.create(request, repositoryName);
        res.status(201).json(Utils.formatDates(entity));
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
});
router.get('', async (req, res) => {
    try {
        const id = req.query.id;
        const state = req.query.state;
        const teacherId = req.query.teacher_id;
        const coordinatorId = req.query.coordinator_id;
        var entities;
        if (id) {
            const entity = await Repository.getById(id, repositoryName);
            entities = entity ? [entity] : [];
        } else {
            const filters = [];
            if (state) {
                filters.push(['state', '==', state]);
            }
            if (teacherId) {
                filters.push(['teacher_id', '==', teacherId]);
            }
            if (coordinatorId) {
                filters.push(['coordinator_id', '==', coordinatorId]);
            }
            entities = await Repository.query(repositoryName, filters);
        }
        res.status(200).json(entities.map(Utils.formatDates));
    } catch (error) {
        res.status(412).json({ message: error.message });
    }
});
router.patch('', async (req, res) => {
    try {
        const id = req.query.id;
        const entity = await Repository.update(id, req.body, repositoryName);
        res.status(200).json(Utils.formatDates(entity));
    } catch (error) {
        res.status(412).json({ message: error.message });
    }
});
router.delete('', async (req, res) => {
    try {
        const id = req.query.id;
        const result = await Repository.delete(id, repositoryName);
        res.status(200).json(result);
    } catch (error) {
        res.status(412).json({ message: error.message });
    }
});

router.get('/questions', async (req, res) => {
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
        res.status(412).json({ message: error.message });
    }
});
router.post('/evaluate', async (req, res) => {
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
        res.status(409).json({ message: error.message });
    }
});

module.exports = router;
