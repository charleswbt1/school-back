class PeriodRegisterRequest {
    constructor({
        coordinator_id,
        month,
        year,
        courses = []
    }) {
        this.coordinator_id = coordinator_id;
        this.month = month;
        this.year = year;
        this.courses = courses;
    }
}

module.exports = PeriodRegisterRequest;