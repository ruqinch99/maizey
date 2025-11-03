<template>
  <aside class="chat-history-panel">
    <header class="chat-history-panel__header">
      <button
        @click="handleNewChat"
        :disabled="isInitializing"
        class="chat-history-panel__new-chat-button"
      >
        + New Chat
      </button>
    </header>

    <nav class="chat-history-panel__content">
      <div v-if="store.loadingConversations" class="chat-history-panel__loading">Loading...</div>

      <div v-else-if="store.conversations.length === 0" class="chat-history-panel__empty">
        No conversations yet
      </div>

      <div v-else class="chat-history-panel__list">
        <button
          v-for="conversation in store.conversations"
          :key="conversation.conversation_pk"
          @click="handleSelectConversation(conversation.conversation_pk)"
          :class="[
            'chat-history-panel__item',
            store.currentConversation?.conversation_pk === conversation.conversation_pk &&
              'chat-history-panel__item--active',
          ]"
        >
          <div class="chat-history-panel__title">
            <input
              :value="editableTitles[conversation.conversation_pk] ?? conversation.title"
              @input="
                editableTitles[conversation.conversation_pk] = (
                  $event.target as HTMLInputElement
                ).value
              "
              @blur="updateTitle(conversation.conversation_pk)"
              @keyup.enter="($event.target as HTMLInputElement).blur()"
              :aria-label="`Chat title: ${conversation.title}`"
              class="chat-history-panel__title-input"
              type="text"
            />
          </div>
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useConversationStore } from '../stores/conversation'

const store = useConversationStore()
const editableTitles = reactive<Record<number, string>>({})
const isInitializing = ref(false)

watch(
  () => store.conversations,
  (conversations) => {
    conversations.forEach((conv) => {
      if (!(conv.conversation_pk in editableTitles)) {
        editableTitles[conv.conversation_pk] = conv.title
      }
    })
  },
  { immediate: true },
)

const handleNewChat = async () => {
  if (isInitializing.value) return
  try {
    isInitializing.value = true
    await store.initializeConversation()
  } catch (error) {
    console.error('Failed to create conversation:', error)
  } finally {
    isInitializing.value = false
  }
}

const handleSelectConversation = async (conversationPk: number) => {
  if (store.currentConversation?.conversation_pk === conversationPk) return
  try {
    await store.loadConversation(conversationPk)
  } catch (error) {
    console.error('Failed to load conversation:', error)
  }
}

const updateTitle = async (conversationPk: number) => {
  const conversation = store.conversations.find((c) => c.conversation_pk === conversationPk)
  const newTitle = editableTitles[conversationPk]?.trim()

  if (!conversation || !newTitle) {
    editableTitles[conversationPk] = conversation?.title ?? ''
    return
  }

  if (newTitle !== conversation.title) {
    try {
      await store.updateConversationTitle(conversationPk, newTitle)
    } catch (error) {
      console.error('Failed to update title:', error)
      editableTitles[conversationPk] = conversation.title
    }
  }
}
</script>
