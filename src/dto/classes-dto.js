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
class MaterialDto {
    constructor({
        id,
        link,
        name,
        description
    }) {
        this.id = id || `MAT_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.link = link;
        this.name = name;
        this.description = description;
    }
}
class JobClassDto {
    constructor({
        id,
        link,
        name,
        description
    }) {
        this.id = id || `JOB_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.link = link;
        this.name = name;
        this.description = description;
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
        this.medias = medias.map(
            media => {
                media.time = new Date(`${media.date}T12:00:00`);
                return new MediaDto(media);
            }
        );
        this.materials = materials.map(material => new MaterialDto(material));
        this.jobs = jobs.map(job => new JobClassDto(job));
    }
}

module.exports = ClassesDto;