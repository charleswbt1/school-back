class MediaClassDto {
    constructor({
        id,
        link,
        name,
        date,
        description,
        delivery_date,
    }) {
        this.id = id || `MEDIA_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.link = link;
        this.name = name;
        this.date = date;
        this.description = description;
        this.delivery_date = delivery_date;
    }
}
class ClassesDto {
    constructor({
        course_id,
        content_id,
        module_id,
        teacher_id,
        medias = [],
        materials = [],
        jobs = []
    }) {
        this.course_id = course_id;
        this.content_id = content_id;
        this.module_id = module_id;
        this.teacher_id = teacher_id;
        this.medias = medias.map(media => new MediaClassDto(media));
        this.materials = materials.map(material => new MediaClassDto(material));
        this.jobs = jobs.map(job => new MediaClassDto(job));
    }
}

module.exports = ClassesDto;