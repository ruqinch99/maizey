export interface Conversation {
  conversation_pk: number
  title: string
  created: string
  updated: string
  message_count: number
}

export interface Message {
  id: number
  conversation_id: number
  query: string
  response: string
  created: string
  sources?: Source[]
}

export interface Source {
  source: string
  link: string
  title: string
}

export interface ChatMessage {
  id: string
  message_id: number
  text: string
  is_user: boolean
  timestamp: string
  sources?: Source[]
}