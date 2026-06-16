class Topic {
    constructor({
        name,
        description,
        multimedia,
        date
    }) {
        this.name = name;
        this.description = description;
        this.multimedia = multimedia;
        this.date = date;
    }
}

class Module {
    constructor({
        name,
        description,
        qualification,
        date,
        exam,
        topics = []
    }) {
        this.name = name;
        this.description = description;
        this.qualification = qualification;
        this.date = date;
        this.exam = exam;
        this.topics = topics.map(
            topic => new Topic(topic)
        );
    }
}

class ContentRegisterRequest {
    constructor({
        name,
        description,
        modules = []
    }) {
        this.name = name;
        this.description = description;
        this.modules = modules.map(
            module => new Module(module)
        );
    }
}

module.exports = ContentRegisterRequest;