class UserDto {
    constructor({
        nick_name,
        password,
        role,
        first_name,
        last_name,
        second_last_name,
        curp,
        phone,
        email,
        image,
        state,
        team_id
    }) {
        this.nick_name = nick_name;
        this.password = password;
        this.role = role;
        this.first_name = first_name;
        this.last_name = last_name;
        this.curp = curp;
        this.second_last_name = second_last_name;
        this.phone = phone;
        this.email = email;
        this.image = image;
        this.state = state;
        this.team_id = team_id;
    }
}

module.exports = UserDto;