<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup name="list">
      <div
        v-for="notification in store.notifications"
        :key="notification.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg text-white flex items-center justify-between min-w-[300px]',
          notification.type === 'success' ? 'bg-green-600' : 
          notification.type === 'error' ? 'bg-red-600' : 
          notification.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        ]"
      >
        <span>{{ notification.message }}</span>
        <button @click="store.remove(notification.id)" class="ml-4 hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '../store/notifications';

const store = useNotificationStore();
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
