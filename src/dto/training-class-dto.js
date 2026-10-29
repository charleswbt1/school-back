class TrainingJobClassDto {
    constructor({
        id,
        link,
        name,
        description,
        delivery_date,
    }) {
        this.id = id || `JOB_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.link = link;
        this.name = name;
        this.description = description;
        this.delivery_date = delivery_date;
    }
}

class TrainingClassDto {
    constructor({
        course_id,
        content_id,
        module_id,
        teacher_id,
        medias = [],
        materials = [],
        jobs = []
    }) {
        this.id = id || `CLASS_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.course_id = course_id;
        this.content_id = content_id;
        this.module_id = module_id;
        this.teacher_id = teacher_id;
        this.medias = medias.map(media => new TrainingJobClassDto(media));
        this.materials = materials.map(material => new TrainingJobClassDto(material));
        this.jobs = jobs.map(job => new TrainingJobClassDto(job));
    }
}

module.exports = TrainingClassDto;