class AttendanceStudentDto {
    constructor({
        student_id,
        status
    }) {
        this.student_id = student_id;
        this.status = status;
    }
}

class AttendanceDto {
    constructor({
        course_id,
        teacher_id,
        date,
        attendances = []
    }) {
        this.id = id || `ATTE_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.course_id = course_id;
        this.teacher_id = teacher_id;
        this.date = date;
        this.attendances = attendances.map(
            attendance => new AttendanceStudentDto(attendance)
        );
    }
}

module.exports = AttendanceDto;