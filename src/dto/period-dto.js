class PeriodRegisterRequest {
    constructor({
        coordinator_id,
        month,
        year,
        courses = [],
        state
    }) {
        this.coordinator_id = coordinator_id;
        this.month = month;
        this.year = year;
        this.courses = courses;
        this.state = state;
    }
}

module.exports = PeriodRegisterRequest;