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
        totalPayments,
        modulesCompleted,
        paymentsCompleted,
        payments
    }) {
        this.user_id = user_id;
        this.course_id = course_id;
        this.content = new ContentRegisterRequest(content);
        this.totalModules = totalModules;
        this.totalPayments = totalPayments;
        this.modulesCompleted = modulesCompleted;
        this.paymentsCompleted = paymentsCompleted;
        this.payments = payments.map(
            payment => new Payment(payment)
        );
    }
}

module.exports = StudentRegisterRequest;