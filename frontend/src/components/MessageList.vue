<template>
  <div ref="messagesContainer" class="message-list">
    <div v-if="!store.hasMessages" class="message-list__empty">
      Start a conversation with Maizey!
    </div>

    <div
      v-for="message in store.messages"
      :key="message.id"
      :class="[
        'message-list__item',
        message.is_user ? 'message-list__item--user' : 'message-list__item--bot',
      ]"
    >
      <div
        :class="[
          'message-list__message',
          message.is_user ? 'message-list__message--user' : 'message-list__message--bot',
        ]"
      >
        <div
          v-if="!message.is_user"
          class="message-list__text markdown-content"
          v-html="renderMarkdown(message.text)"
        ></div>
        <p v-else class="message-list__text">{{ message.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useConversationStore } from '../stores/conversation'

const store = useConversationStore()
const messagesContainer = ref<HTMLElement | null>(null)

marked.setOptions({
  breaks: true,
  gfm: true,
})

function renderMarkdown(text: string): string {
  const html = marked.parse(text)
  return DOMPurify.sanitize(html)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onMounted(() => scrollToBottom())
watch(
  () => store.messages.length,
  () => scrollToBottom(),
)
</script>
