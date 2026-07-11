class Topic {
    constructor({
        id,
        name,
        description,
        link
    }) {
        this.id = id || `TOP_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.name = name;
        this.description = description;
        this.link = link;
    }
}

class Module {
    constructor({
        id,
        name,
        description,
        qualification,
        available,
        link,
        topics = []
    }) {
        this.id = id || `MOD_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.name = name;
        this.description = description;
        this.qualification = qualification;
        this.available = available;
        this.link = link;
        this.topics = topics.map(
            topic => new Topic(topic)
        );
    }
}

class ContentDto {
    constructor({
        name,
        description,
        state,
        coordinator_id,
        modules = []
    }) {
        this.name = name;
        this.description = description;
        this.state = state;
        this.coordinator_id = coordinator_id;
        this.modules = modules.map(
            module => new Module(module)
        );
    }
}

module.exports = ContentDto;