class PeriodRegisterRequest {
    constructor({
        month,
        year,
        courses = []
    }) {
        this.month = month;
        this.year = year;
        this.courses = courses;
    }
}

module.exports = PeriodRegisterRequest;