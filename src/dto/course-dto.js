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
        costInscription,
        offerCostInscription,
        costQuota,
        offerCostQuota,
        costReinscription,
        offerCostReinscription,
        costTitle,
        offerCostTitle,
        numberQuota,
        offer,
        rvoe,
        date_init,
        date_end,
        content
    }) {
        this.name = name;
        this.description = description;
        this.squad_id = squad_id;
        this.content_id = content_id;
        this.adviser_id = adviser_id;
        this.teacher_id = teacher_id;
        this.image = image;
        this.cost = cost;
        this.costInscription = costInscription;
        this.offerCostInscription = offerCostInscription;
        this.costQuota = costQuota;
        this.offerCostQuota = offerCostQuota;
        this.costReinscription = costReinscription;
        this.offerCostReinscription = offerCostReinscription;
        this.costTitle = costTitle;
        this.offerCostTitle = offerCostTitle;
        this.numberQuota = numberQuota;
        this.offer = offer;
        this.rvoe = rvoe;
        this.date_init = date_init;
        this.date_end = date_end;
        this.content = content ? new ContentRegisterRequest(content) : null;
    }
}

module.exports = CourseRegisterRequest;
