<template>
  <div class="message-input">
    <form @submit.prevent="handleSubmit" class="message-input__form">
      <input
        v-model="input"
        type="text"
        placeholder="Ask Maizey anything..."
        autocomplete="off"
        data-1p-ignore
        data-lpignore="true"
        class="message-input__field"
      />
      <button
        type="submit"
        :disabled="!input.trim() || store.sendingMessage"
        class="message-input__button"
      >
        {{ store.sendingMessage ? 'Sending...' : 'Send' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConversationStore } from '../stores/conversation'

const store = useConversationStore()
const input = ref('')

const handleSubmit = async () => {
  if (!input.value.trim()) return
  const query = input.value.trim()
  input.value = ''
  try {
    await store.sendMessage(query)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}
</script>
