class Topic {
    constructor({
        name,
        description,
        multimedia
    }) {
        this.name = name;
        this.description = description;
        this.multimedia = multimedia;
    }
}

class Module {
    constructor({
        name,
        exam,
        topics = []
    }) {
        this.name = name;
        this.exam = exam;
        this.topics = topics.map(
            topic => new Topic(topic)
        );
    }
}

class ContentRegisterRequest {
    constructor({
        id,
        name,
        description,
        modules = []
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.modules = modules.map(
            module => new Module(module)
        );
    }
}

module.exports = ContentRegisterRequest;