class SquadRegisterRequest {
    constructor({
        name,
        description,
        cct,
        logo
    }) {
        this.name = name;
        this.description = description;
        this.cct = cct;
        this.logo = logo;
    }
}

module.exports = SquadRegisterRequest;