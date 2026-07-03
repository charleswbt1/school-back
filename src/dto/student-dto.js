const ContentRegisterRequest = require('../dto/content-dto.js');

class Payment {
    constructor({
        id,
        year,
        month,
        amount,
        date,
        url,
        source
    }) {
        this.id = id;
        this.year = year;
        this.month = month;
        this.amount = amount;
        this.date = date;
        this.url = url;
        this.source = source;
    }
}
class Document {
    constructor({
        type,
        url
    }) {
        this.type = type;
        this.url = url;
    }
}
class Note {
    constructor({
        module_id,
        value,
        state
    }) {
        this.module_id = module_id;
        this.value = value;
        this.state = state;
    }
}
class Progress {
    constructor({
        topic_id,
        value,
        state
    }) {
        this.topic_id = topic_id;
        this.value = value;
        this.state = state;
    }
}

class StudentRegisterRequest {
    constructor({
        school_id,
        user_id,
        course_id,
        adviser_id,
        coordinator_id,
        image,
        course_name,
        average,
        total_modules,
        total_cost,
        modules_completed,
        cost_completed,
        state,
        payments,
        documents,
        notes,
        progresses
    }) {
        this.school_id = school_id;
        this.user_id = user_id;
        this.course_id = course_id;
        this.adviser_id = adviser_id;
        this.coordinator_id = coordinator_id;
        this.image = image;
        this.course_name = course_name;
        this.average = average;
        this.total_modules = total_modules;
        this.total_cost = total_cost;
        this.modules_completed = modules_completed;
        this.cost_completed = cost_completed;
        this.state = state;
        this.payments = payments.map(
            payment => new Payment(payment)
        );
        this.documents = documents.map(
            document => new Document(document)
        );
        this.notes = notes.map(
            note => new Note(note)
        );
        this.progresses = progresses.map(
            progress => new Progress(progress)
        );
    }
}

module.exports = StudentRegisterRequest;