import axios, { AxiosError } from 'axios'
import type { Conversation, Message } from '../types/conversation'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

function getErrorMessage(error: AxiosError, defaultMessage: string): string {
  const responseData = error.response?.data as { error?: string; detail?: string } | undefined

  if (responseData?.error) {
    return responseData.error
  }
  if (responseData?.detail) {
    return responseData.detail
  }
  if (error.response) {
    return `${error.response.status} ${error.response.statusText}`
  }
  return error.message || defaultMessage
}

async function getConversations(): Promise<Conversation[]> {
  try {
    const response = await api.get<Conversation[]>('/conversations/')
    return response.data
  } catch (err) {
    throw new Error(getErrorMessage(err as AxiosError, 'Failed to load conversations'))
  }
}

async function createConversation(): Promise<Conversation> {
  try {
    const response = await api.post<Conversation>('/conversations/')
    return response.data
  } catch (err) {
    throw new Error(getErrorMessage(err as AxiosError, 'Failed to create conversation'))
  }
}

async function getConversation(conversationPk: number): Promise<Conversation> {
  try {
    const response = await api.get<Conversation>(`/conversations/${conversationPk}/`)
    return response.data
  } catch (err) {
    const error = err as AxiosError
    if (error.response?.status === 404) {
      throw new Error(`Conversation ${conversationPk} not found`)
    }
    throw new Error(getErrorMessage(error, 'Failed to load conversation'))
  }
}

async function getConversationMessages(conversationPk: number): Promise<Message[]> {
  try {
    const response = await api.get<Message[]>(`/conversations/${conversationPk}/messages/`)
    return response.data
  } catch (err) {
    const error = err as AxiosError
    if (error.response?.status === 404) {
      throw new Error(`Conversation ${conversationPk} not found`)
    }
    throw new Error(getErrorMessage(error, 'Failed to load messages'))
  }
}

async function sendMessage(conversationPk: number, query: string): Promise<Message> {
  try {
    const response = await api.post<Message>(`/conversations/${conversationPk}/messages/send/`, {
      query,
    })
    return response.data
  } catch (err) {
    const error = err as AxiosError
    if (error.response?.status === 400) {
      const validationErrors = error.response.data as { [key: string]: any } | string
      throw new Error(`Invalid request: ${JSON.stringify(validationErrors)}`)
    }
    if (error.response?.status === 404) {
      throw new Error(`Conversation ${conversationPk} not found`)
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please check your API credentials.')
    }
    throw new Error(getErrorMessage(error, 'Failed to send message'))
  }
}

async function updateConversation(conversationPk: number, title: string): Promise<Conversation> {
  try {
    const response = await api.patch<Conversation>(`/conversations/${conversationPk}/`, { title })
    return response.data
  } catch (err) {
    const error = err as AxiosError
    if (error.response?.status === 404) {
      throw new Error(`Conversation ${conversationPk} not found`)
    }
    if (error.response?.status === 400) {
      const validationErrors = error.response.data as { [key: string]: any } | string
      throw new Error(`Invalid request: ${JSON.stringify(validationErrors)}`)
    }
    throw new Error(getErrorMessage(error, 'Failed to update conversation'))
  }
}

export const conversationService = {
  getConversations,
  createConversation,
  getConversation,
  getConversationMessages,
  sendMessage,
  updateConversation,
}
