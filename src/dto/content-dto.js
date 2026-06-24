class Topic {
    constructor({
        name,
        description,
    }) {
        this.name = name;
        this.description = description;
    }
}

class Module {
    constructor({
        name,
        description,
        qualification,
        topics = []
    }) {
        this.name = name;
        this.description = description;
        this.qualification = qualification;
        this.topics = topics.map(
            topic => new Topic(topic)
        );
    }
}

class ContentRegisterRequest {
    constructor({
        name,
        description,
        state,
        modules = []
    }) {
        this.name = name;
        this.description = description;
        this.state = state;
        this.modules = modules.map(
            module => new Module(module)
        );
    }
}

module.exports = ContentRegisterRequest;