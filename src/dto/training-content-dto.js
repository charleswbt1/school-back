class TrainingModuleDto {
    constructor({
        id,
        name,
        topics
    }) {
        this.id = id || `MOD_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.name = name;
        this.topics = topics;
    }
}

class TrainingContentDto {
    constructor({
        coordinator_id,
        name,
        modules = []
    }) {
        this.name = name;
        this.description = description;
        this.state = state;
        this.coordinator_id = coordinator_id;
        this.modules = modules.map(
            module => new TrainingModuleDto(module)
        );
    }
}

module.exports = TrainingContentDto;