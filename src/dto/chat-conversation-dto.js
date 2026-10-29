class ChatConversationDto {
    constructor({
        name,
        type,
        participant_ids = [],
    }) {
        this.id = id || `CONV_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.name = name;
        this.type = type;
        this.participant_ids = participant_ids;
    }
}

module.exports = ChatConversationDto;