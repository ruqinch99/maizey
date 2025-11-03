import type { ChatMessage, Message } from '../types/conversation'

export function convertMessageToChatMessages(msg: Message): ChatMessage[] {
  const messageId = msg.id
  return [
    {
      id: `${messageId}-user`,
      message_id: messageId,
      text: msg.query,
      is_user: true,
      timestamp: msg.created,
    },
    {
      id: `${messageId}-bot`,
      message_id: messageId,
      text: msg.response,
      is_user: false,
      timestamp: msg.created,
      sources: msg.sources,
    },
  ]
}