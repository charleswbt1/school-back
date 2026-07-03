class PeriodRegisterRequest {
    constructor({
        coordinator_id,
        month,
        year,
        courses = [],
        coursesId = [],
        state
    }) {
        this.coordinator_id = coordinator_id;
        this.month = month;
        this.year = year;
        this.courses = courses;
        this.coursesId = coursesId;
        this.state = state;
    }
}

module.exports = PeriodRegisterRequest;