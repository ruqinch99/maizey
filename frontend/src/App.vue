<template>
  <div class="chat-interface">
    <ChatHistory />

    <main class="chat-interface__main">
      <header class="chat-interface__header">
        <h1 class="chat-interface__header-title">U-M Maizey</h1>
      </header>

      <div v-if="store.error" class="chat-interface__error">
        {{ store.error }}
      </div>

      <MessageList />
      <MessageInput />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import ChatHistory from './components/ChatHistory.vue'
import MessageInput from './components/MessageInput.vue'
import MessageList from './components/MessageList.vue'
import { useConversationStore } from './stores/conversation'

const store = useConversationStore()

onMounted(async () => {
  await store.loadConversations()

  if (!store.currentConversation) {
    if (store.conversations.length === 0) {
      try {
        await store.initializeConversation()
      } catch (error) {
        console.error('Failed to initialize conversation:', error)
      }
    } else {
      const mostRecent = store.conversations[0]
      if (mostRecent) {
        await store.loadConversation(mostRecent.conversation_pk)
      }
    }
  }
})
</script>
