class AnswerDto {
    constructor({
        answer,
        is_correct,
    }) {
        this.answer = answer;
        this.is_correct = is_correct;
    }
}
class QuestionDto {
    constructor({
        question,
        answers = []
    }) {
        this.question = question;
        this.answers = answers.map(answer => new AnswerDto(answer));
    }
}
class ExamDto {
    constructor({
        coordinator_id,
        teacher_id,
        name,
        description,
        approve,
        state,
        questions = []
    }) {
        this.coordinator_id = coordinator_id;
        this.teacher_id = teacher_id;
        this.name = name;
        this.description = description;
        this.approve = approve;
        this.state = state;
        this.questions = questions.map(question => new QuestionDto(question));
    }
}

module.exports = ExamDto;