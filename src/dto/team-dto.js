class TeamDto {
    constructor({
        name,
        description,
        logo,
        state,
        stripe_id
    }) {
        this.name = name;
        this.description = description;
        this.logo = logo;
        this.state = state;
        this.stripe_id = stripe_id;
    }
}

module.exports = TeamDto;