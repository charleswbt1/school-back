class UserTrackDto {
    constructor({
        user_id,
        role,
        team_id,
        event,
        table_name,
        register_id,
        flow,
        description
    }) {
        this.user_id = user_id;
        this.role = role;
        this.team_id = team_id;
        this.event = event;
        this.table_name = table_name;
        this.register_id = register_id;
        this.flow = flow;
        this.description = description;
    }
}
module.exports = UserTrackDto;