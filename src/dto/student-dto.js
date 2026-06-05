const ContentRegisterRequest = require('../dto/content-dto.js');

class Payment {
    constructor({
        amount,
        date,
        url
    }) {
        this.amount = amount;
        this.date = date;
        this.url = url;
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
        user_id,
        course_id,
        adviser_id,
        image,
        course_name,
        content,
        totalModules,
        totalCost,
        modulesCompleted,
        costCompleted,
        payments,
        documents
    }) {
        this.user_id = user_id;
        this.course_id = course_id;
        this.adviser_id = adviser_id;
        this.image = image;
        this.course_name = course_name;
        this.content = new ContentRegisterRequest(content);
        this.totalModules = totalModules;
        this.totalCost = totalCost;
        this.modulesCompleted = modulesCompleted;
        this.costCompleted = costCompleted;
        this.payments = payments.map(
            payment => new Payment(payment)
        );
        this.documents = documents.map(
            document => new Document(document)
        );
    }
}

module.exports = StudentRegisterRequest;