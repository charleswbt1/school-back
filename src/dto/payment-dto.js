class PaymentDto {
    constructor({
        stripe_id,
        stripe_data,
        student_id,
        amount,
        year,
        month,
        type
    }) {
        this.stripe_id = stripe_id;
        this.stripe_data = stripe_data;
        this.student_id = student_id;
        this.amount = amount;
        this.year = year;
        this.month = month;
        this.type = type;
    }
}

module.exports = PaymentDto;