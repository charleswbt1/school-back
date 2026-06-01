class UserRegisterRequest {
    constructor({
        nick_name,
        password,
        role,
        name,
        phone,
        email
    }) {
        this.nick_name = nick_name;
        this.password = password;
        this.role = role;
        this.name = name;
        this.phone = phone;
        this.email = email;
    }
}

module.exports = UserRegisterRequest;