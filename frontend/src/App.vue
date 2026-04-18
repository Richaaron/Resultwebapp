<script setup lang="ts">
import { LayoutDashboard, Users, FileEdit, LogOut } from 'lucide-vue-next';
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-primary-900 text-white flex flex-col">
      <div class="p-6">
        <h1 class="text-xl font-bold tracking-tight">Folusho Victory</h1>
        <p class="text-xs text-primary-300">Result Management System</p>
      </div>
      
      <nav class="flex-1 px-4 space-y-2">
        <router-link 
          to="/" 
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-primary-800 transition-colors"
          active-class="bg-primary-800 text-white"
        >
          <LayoutDashboard class="w-5 h-5 mr-3" />
          Dashboard
        </router-link>
        
        <router-link 
          to="/students" 
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-primary-800 transition-colors"
          active-class="bg-primary-800 text-white"
        >
          <Users class="w-5 h-5 mr-3" />
          Students
        </router-link>
        
        <router-link 
          to="/score-entry" 
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-primary-800 transition-colors"
          active-class="bg-primary-800 text-white"
        >
          <FileEdit class="w-5 h-5 mr-3" />
          Score Entry
        </router-link>
      </nav>
      
      <div class="p-4 border-t border-primary-800">
        <button class="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg hover:bg-red-600 transition-colors text-primary-100">
          <LogOut class="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <header class="bg-white shadow-sm px-8 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">{{ $route.name }}</h2>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">Academic Session: 2023/2024</span>
          </div>
        </div>
      </header>
      
      <div class="p-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
