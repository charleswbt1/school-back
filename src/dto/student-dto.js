const ContentRegisterRequest = require('../dto/content-dto.js');

class Payment {
    constructor({
        amount,
        date,
        image
    }) {
        this.amount = amount;
        this.date = date;
        this.image = image;
    }
}
class StudentRegisterRequest {
    constructor({
        user_id,
        course_id,
        content,
        totalModules,
        totalCost,
        modulesCompleted,
        costCompleted,
        payments
    }) {
        this.user_id = user_id;
        this.course_id = course_id;
        this.content = new ContentRegisterRequest(content);
        this.totalModules = totalModules;
        this.totalCost = totalCost;
        this.modulesCompleted = modulesCompleted;
        this.costCompleted = costCompleted;
        this.payments = payments.map(
            payment => new Payment(payment)
        );
    }
}

module.exports = StudentRegisterRequest;