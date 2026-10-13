class TrainingCostDto {
    constructor({
        inscription,
        quota,
        reinscription,
        title,
        title_two
    }) {
        this.inscription = inscription;
        this.quota = quota;
        this.reinscription = reinscription;
        this.title = title;
        this.title_two = title_two;
    }
}
class TrainingAsignatureDto {
    constructor({
        teacher_id,
        content_id
    }) {
        this.teacher_id = teacher_id;
        this.content_id = content_id;
    }
}

class TrainingCourseDto {
    constructor({
        id,
        name,
        description,
        level,
        model,
        coordinator_id,
        squad_id,
        adviser_id,
        period_id,
        image,
        rvoe,
        date_init,
        date_end,
        state,
        asignatures = [],
        cost,
        cost_market
    }) {
        this.id = id || `COU_${Date.now()}`;
        this.name = name;
        this.description = description;
        this.level = level;
        this.model = model;
        this.coordinator_id = coordinator_id;
        this.squad_id = squad_id;
        this.adviser_id = adviser_id;
        this.period_id = period_id;
        this.image = image;
        this.rvoe = rvoe;
        this.date_init = date_init;
        this.date_end = date_end;
        this.state = state;
        this.asignatures = asignatures.map(asignature => new TrainingAsignatureDto(asignature));
        this.cost = new TrainingCostDto(cost);
        this.cost_market = new TrainingCostDto(cost_market) || null;
    }
}

module.exports = TrainingCourseDto;