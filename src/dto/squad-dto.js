class SquadDto {
    constructor({
        name,
        description,
        cct,
        logo,
        state
    }) {
        this.name = name;
        this.description = description;
        this.cct = cct;
        this.logo = logo;
        this.state = state;
    }
}

module.exports = SquadDto;