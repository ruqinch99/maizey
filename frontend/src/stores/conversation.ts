import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { conversationService } from '../services/conversation'
import type { ChatMessage, Conversation } from '../types/conversation'
import { convertMessageToChatMessages } from '../utils/messageTransform'

export const useConversationStore = defineStore('conversation', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<ChatMessage[]>([])
  const loadingConversation = ref(false)
  const loadingConversations = ref(false)
  const sendingMessage = ref(false)
  const error = ref<string | null>(null)

  const hasMessages = computed(() => messages.value.length > 0)

  async function loadConversations() {
    if (loadingConversations.value) {
      return
    }
    try {
      loadingConversations.value = true
      error.value = null
      conversations.value = await conversationService.getConversations()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load conversations'
      console.error(err)
    } finally {
      loadingConversations.value = false
    }
  }

  async function loadConversation(conversationPk: number) {
    if (
      loadingConversation.value &&
      currentConversation.value?.conversation_pk === conversationPk
    ) {
      return
    }
    try {
      loadingConversation.value = true
      error.value = null
      const [backendMessages, conversation] = await Promise.all([
        conversationService.getConversationMessages(conversationPk),
        conversationService.getConversation(conversationPk),
      ])
      messages.value = backendMessages.flatMap(convertMessageToChatMessages)
      currentConversation.value = conversation
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load conversation'
      throw err
    } finally {
      loadingConversation.value = false
    }
  }

  async function initializeConversation() {
    try {
      loadingConversation.value = true
      error.value = null
      const conversation = await conversationService.createConversation()
      currentConversation.value = conversation
      messages.value = []

      loadConversations().catch((err) => console.error('Failed to reload conversations:', err))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create conversation'
      throw err
    } finally {
      loadingConversation.value = false
    }
  }

  async function sendMessage(query: string) {
    if (!currentConversation.value) {
      throw new Error('No conversation initialized')
    }

    sendingMessage.value = true
    const tempMessageId = -Date.now()

    const userMsg: ChatMessage = {
      id: `${tempMessageId}-user`,
      message_id: tempMessageId,
      text: query,
      is_user: true,
      timestamp: new Date().toISOString(),
    }
    messages.value.push(userMsg)

    try {
      const response = await conversationService.sendMessage(
        currentConversation.value.conversation_pk,
        query,
      )
      const messageId = response.id
      const lastIndex = messages.value.length - 1

      messages.value[lastIndex] = {
        id: `${messageId}-user`,
        message_id: messageId,
        text: query,
        is_user: true,
        timestamp: response.created,
      }

      messages.value.push({
        id: `${messageId}-bot`,
        message_id: messageId,
        text: response.response,
        is_user: false,
        timestamp: response.created,
        sources: response.sources,
      })

      currentConversation.value.message_count += 1
      currentConversation.value.updated = response.created

      const index = conversations.value.findIndex(
        (c) => c.conversation_pk === currentConversation.value!.conversation_pk,
      )
      if (index !== -1) {
        conversations.value[index] = { ...currentConversation.value }
        conversations.value.sort(
          (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime(),
        )
      }
    } catch (err) {
      messages.value.pop()
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      throw err
    } finally {
      sendingMessage.value = false
    }
  }

  async function updateConversationTitle(conversationPk: number, title: string) {
    try {
      error.value = null
      const updatedConversation = await conversationService.updateConversation(
        conversationPk,
        title,
      )

      if (currentConversation.value?.conversation_pk === conversationPk) {
        currentConversation.value.title = title
      }

      const index = conversations.value.findIndex((c) => c.conversation_pk === conversationPk)
      if (index !== -1) {
        conversations.value[index] = updatedConversation
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update conversation title'
      throw err
    }
  }

  return {
    conversations,
    currentConversation,
    messages,
    loadingConversation,
    loadingConversations,
    sendingMessage,
    error,
    hasMessages,
    loadConversations,
    loadConversation,
    initializeConversation,
    sendMessage,
    updateConversationTitle,
  }
})
