const ContentRegisterRequest = require('../dto/content-dto.js');

class CourseRegisterRequest {
    constructor({
        name,
        description,
        squad_id,
        content_id,
        adviser_id,
        teacher_id,
        image,
        cost,
        cost_inscription,
        offer_cost_inscription,
        cost_quota,
        offer_cost_quota,
        cost_reinscription,
        offer_cost_reinscription,
        cost_title,
        offer_cost_title,
        number_quota,
        rvoe,
        date_init,
        date_end,
        content,
        month,
        year
    }) {
        this.name = name;
        this.description = description;
        this.squad_id = squad_id;
        this.content_id = content_id;
        this.adviser_id = adviser_id;
        this.teacher_id = teacher_id;
        this.image = image;
        this.cost = cost;
        this.cost_inscription = cost_inscription;
        this.offer_cost_inscription = offer_cost_inscription;
        this.cost_quota = cost_quota;
        this.offer_cost_quota = offer_cost_quota;
        this.cost_reinscription = cost_reinscription;
        this.offer_cost_reinscription = offer_cost_reinscription;
        this.cost_title = cost_title;
        this.offer_cost_title = offer_cost_title;
        this.number_quota = number_quota;
        this.rvoe = rvoe;
        this.date_init = date_init;
        this.date_end = date_end;
        this.content = content ? new ContentRegisterRequest(content) : null;
        this.month = month;
        this.year = year;
    }
}

module.exports = CourseRegisterRequest;
