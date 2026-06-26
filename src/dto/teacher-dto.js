class TeacherRegisterRequest {
    constructor({
        user_id,
        hours,
        courses = [],
        state
    }) {
        this.user_id = user_id;
        this.hours = hours;
        this.courses = courses;
        this.state = state;
    }
}

module.exports = TeacherRegisterRequest;