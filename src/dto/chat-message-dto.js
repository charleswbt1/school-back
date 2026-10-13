class ChatMessageDto {
    constructor({
        conversation_id,
        sender_id,
        sender_name,
        text,
        type = 'text'
    }) {
        this.conversation_id = conversation_id;
        this.sender_id = sender_id;
        this.sender_name = sender_name;
        this.text = text;
        this.type = type;
    }
}
module.exports = ChatMessageDto;