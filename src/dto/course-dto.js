class CourseRegisterRequest {
    constructor({
        name,
        description,
        squad_id,
        content_id,
        adviser_id,
        image,
        cost,
        monthly_payment,
        rvoe,
        date_init,
        date_end
    }) {
        this.name = name;
        this.description = description;
        this.squad_id = squad_id;
        this.content_id = content_id;
        this.adviser_id = adviser_id;
        this.image = image;
        this.cost = cost;
        this.monthly_payment = monthly_payment;
        this.rvoe = rvoe;
        this.date_init = date_init;
        this.date_end = date_end;
    }
}

module.exports = CourseRegisterRequest;
