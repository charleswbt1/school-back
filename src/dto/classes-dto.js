class MediaDto {
    constructor({
        link,
        date
    }) {
        this.link = link;
        this.date = date;
    }
}
class ClassesDto {
    constructor({
        course_id,
        content_id,
        module_id,
        medias = []
    }) {
        this.course_id = course_id;
        this.content_id = content_id;
        this.module_id = module_id;
        this.medias = medias.map(
            media => new MediaDto(media)
        );
    }
}

module.exports = ClassesDto;