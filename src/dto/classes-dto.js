class MediaDto {
    constructor({
        link,
        date,
        time
    }) {
        this.link = link;
        this.date = date;
        this.time = time;
    }
}
class ClassesDto {
    constructor({
        course_id,
        content_id,
        module_id,
        teacher_id,
        medias = []
    }) {
        this.course_id = course_id;
        this.content_id = content_id;
        this.module_id = module_id;
        this.teacher_id = teacher_id;
        this.medias = medias.map(
            media => {
                media.time = new Date(`${media.date}T12:00:00`);
                return new MediaDto(media);
            }
        );
    }
}

module.exports = ClassesDto;