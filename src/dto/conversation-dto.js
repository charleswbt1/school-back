class ConversationDto {
    constructor({
        type,
        participant_ids = [],
        course_id
    }) {
        this.type = type;
        this.participant_ids = participant_ids;
        this.course_id = course_id;
        if (participant_ids.length > 0) {
            this.participant_key = [...participant_ids]
                .sort()
                .join('_');
        }
    }
}

module.exports = ConversationDto;