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
        offer,
        rvoe,
        date_init,
        date_end,
        content,
        inscription_available
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
        this.offer = offer;
        this.quota = quota;
        this.rvoe = rvoe;
        this.date_init = date_init;
        this.date_end = date_end;
        this.content = new ContentRegisterRequest(content);
        this.inscription_available = inscription_available
    }
}

module.exports = CourseRegisterRequest;
