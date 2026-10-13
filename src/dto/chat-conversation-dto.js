class ChatConversationDto {
    constructor({
        name,
        type,
        participant_ids = [],
    }) {
        this.name = name;
        this.type = type;
        this.participant_ids = participant_ids;
    }
}

module.exports = ChatConversationDto;