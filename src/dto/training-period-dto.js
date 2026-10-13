class PeriodCourseDto {
    constructor({
        name,
        course_id
    }) {
        this.name = name;
        this.course_id = course_id;
    }
}

class TrainingPeriodDto {
    constructor({
        coordinator_id,
        year,
        month,
        courses = [],
    }) {
        this.coordinator_id = coordinator_id;
        this.year = year;
        this.month = month;
        this.courses = courses.map(course => new PeriodCourseDto(course));
    }
}

module.exports = TrainingPeriodDto;