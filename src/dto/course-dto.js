class CourseRegisterRequest {
    constructor({
        name,
        description,
        squad_id,
        content_id,
        image,
        cost,
        rvoe,
        date_init,
        date_end
    }) {
        this.name = name;
        this.description = description;
        this.squad_id = squad_id;
        this.content_id = content_id;
        this.image = image;
        this.cost = cost;
        this.rvoe = rvoe;
        this.date_init = date_init;
        this.date_end = date_end;
    }
}

module.exports = CourseRegisterRequest;
