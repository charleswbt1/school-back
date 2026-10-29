class ChatMessageDto {
    constructor({
        conversation_id,
        sender_id,
        sender_name,
        text,
        type = 'text'
    }) {
        this.id = id || `MESS_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.conversation_id = conversation_id;
        this.sender_id = sender_id;
        this.sender_name = sender_name;
        this.text = text;
        this.type = type;
    }
}

module.exports = ChatMessageDto;