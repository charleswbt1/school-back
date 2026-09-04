class MessageDto {
    constructor({
        conversation_id,
        sender_id,
        text,
        type = 'text'
    }) {
        this.conversation_id = conversation_id;
        this.sender_id = sender_id;
        this.text = text;
        this.type = type;
    }
}
module.exports = MessageDto;