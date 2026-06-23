const ContentRegisterRequest = require('../dto/content-dto.js');

class Payment {
    constructor({
        year,
        month,
        amount,
        date,
        url,
        source
    }) {
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
class StudentRegisterRequest {
    constructor({
        school_id,
        user_id,
        course_id,
        adviser_id,
        coordinator_id,
        image,
        course_name,
        content,
        average,
        total_modules,
        total_cost,
        modules_completed,
        cost_completed,
        state,
        payments,
        documents
    }) {
        this.school_id = school_id;
        this.user_id = user_id;
        this.course_id = course_id;
        this.adviser_id = adviser_id;
        this.coordinator_id = coordinator_id;
        this.image = image;
        this.course_name = course_name;
        this.content = new ContentRegisterRequest(content);
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
    }
}

module.exports = StudentRegisterRequest;