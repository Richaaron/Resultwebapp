<script setup lang="ts">
import { ref, computed } from 'vue';
import { LayoutDashboard, Users, FileEdit, LogOut, ShieldCheck, BookOpen, Table, Menu, X, Settings } from 'lucide-vue-next';
import { useAuthStore } from './store/auth';
import { useRouter, useRoute } from 'vue-router';
import ToastContainer from './components/ToastContainer.vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const isMobileMenuOpen = ref(false);
const schoolSlug = computed(() => route.params.schoolSlug as string);

const handleLogout = () => {
  auth.logout();
  router.push(`/${schoolSlug.value}/login`);
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <ToastContainer />
  <div v-if="route.name === 'Login' || route.name === 'Setup' || route.name === 'ResultChecker'" class="min-h-screen">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
  <div v-else class="min-h-screen flex flex-col lg:flex-row bg-[#1a1400]">
    <!-- Mobile Header -->
    <div class="lg:hidden fixed top-0 left-0 right-0 bg-[#0d0a00] border-b border-gold-900/30 px-6 py-4 flex items-center justify-between z-50">
      <h1 class="text-lg font-black text-gold-500 uppercase tracking-tighter truncate pr-4">{{ auth.user?.school?.name || 'Result System' }}</h1>
      <button @click="isMobileMenuOpen = true" class="text-gold-500 shrink-0">
        <Menu class="w-6 h-6" />
      </button>
    </div>

    <!-- Sidebar Overlay (Mobile) -->
    <div 
      v-if="isMobileMenuOpen" 
      @click="isMobileMenuOpen = false"
      class="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="fixed lg:static inset-y-0 left-0 w-64 bg-[#0d0a00] text-gold-100 flex flex-col border-r border-gold-900/30 z-[70] transition-transform duration-300 lg:translate-x-0"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-6 flex items-center justify-between">
        <div class="overflow-hidden">
          <h1 class="text-xl font-black tracking-tight text-gold-500 uppercase truncate">{{ auth.user?.school?.name || 'Result System' }}</h1>
          <p class="text-[10px] text-gold-700 font-bold uppercase tracking-widest truncate">{{ auth.user?.school?.motto || 'Management Suite' }}</p>
        </div>
        <button @click="isMobileMenuOpen = false" class="lg:hidden text-gold-700 shrink-0 ml-2">
          <X class="w-6 h-6" />
        </button>
      </div>
      
      <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
        <router-link 
          :to="`/${schoolSlug}`" 
          @click="isMobileMenuOpen = false"
          class="flex items-center px-4 py-3 text-sm font-bold rounded-xl hover:bg-gold-900/50 hover:text-gold-400 transition-all group"
          active-class="bg-gold-500 text-black shadow-lg shadow-gold-500/20"
        >
          <LayoutDashboard class="w-5 h-5 mr-3" />
          Dashboard
        </router-link>

        <router-link 
          v-if="auth.isAdmin"
          :to="`/${schoolSlug}/teachers`" 
          @click="isMobileMenuOpen = false"
          class="flex items-center px-4 py-3 text-sm font-bold rounded-xl hover:bg-gold-900/50 hover:text-gold-400 transition-all group"
          active-class="bg-gold-500 text-black shadow-lg shadow-gold-500/20"
        >
          <ShieldCheck class="w-5 h-5 mr-3" />
          Teachers
        </router-link>

        <router-link 
          v-if="auth.isAdmin"
          :to="`/${schoolSlug}/subjects`" 
          @click="isMobileMenuOpen = false"
          class="flex items-center px-4 py-3 text-sm font-bold rounded-xl hover:bg-gold-900/50 hover:text-gold-400 transition-all group"
          active-class="bg-gold-500 text-black shadow-lg shadow-gold-500/20"
        >
          <BookOpen class="w-5 h-5 mr-3" />
          Subjects
        </router-link>
        
        <router-link 
          :to="`/${schoolSlug}/students`" 
          @click="isMobileMenuOpen = false"
          class="flex items-center px-4 py-3 text-sm font-bold rounded-xl hover:bg-gold-900/50 hover:text-gold-400 transition-all group"
          active-class="bg-gold-500 text-black shadow-lg shadow-gold-500/20"
        >
          <Users class="w-5 h-5 mr-3" />
          Students
        </router-link>

        <router-link 
          :to="`/${schoolSlug}/broadsheet`" 
          @click="isMobileMenuOpen = false"
          class="flex items-center px-4 py-3 text-sm font-bold rounded-xl hover:bg-gold-900/50 hover:text-gold-400 transition-all group"
          active-class="bg-gold-500 text-black shadow-lg shadow-gold-500/20"
        >
          <Table class="w-5 h-5 mr-3" />
          Broadsheet
        </router-link>
        
        <router-link 
          :to="`/${schoolSlug}/score-entry`" 
          @click="isMobileMenuOpen = false"
          class="flex items-center px-4 py-3 text-sm font-bold rounded-xl hover:bg-gold-900/50 hover:text-gold-400 transition-all group"
          active-class="bg-gold-500 text-black shadow-lg shadow-gold-500/20"
        >
          <FileEdit class="w-5 h-5 mr-3" />
          Score Entry
        </router-link>

        <router-link 
          v-if="auth.isAdmin"
          :to="`/${schoolSlug}/settings`" 
          @click="isMobileMenuOpen = false"
          class="flex items-center px-4 py-3 text-sm font-bold rounded-xl hover:bg-gold-900/50 hover:text-gold-400 transition-all group"
          active-class="bg-gold-500 text-black shadow-lg shadow-gold-500/20"
        >
          <Settings class="w-5 h-5 mr-3" />
          Settings
        </router-link>
      </nav>
      
      <div class="p-4 border-t border-gold-900/30 bg-black/20">
        <div class="flex items-center px-4 py-3 mb-4 bg-gold-900/20 rounded-xl border border-gold-900/30">
          <div class="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-black font-black mr-3 shadow-inner shrink-0">
            <img v-if="auth.user?.image" :src="auth.user.image" class="w-full h-full rounded-full object-cover" />
            <span v-else>{{ auth.user?.fullName.charAt(0) }}</span>
          </div>
          <div class="overflow-hidden">
            <p class="text-sm font-black truncate text-gold-100">{{ auth.user?.fullName }}</p>
            <p class="text-[10px] text-gold-500 uppercase tracking-tighter font-black">{{ auth.user?.role }}</p>
          </div>
        </div>
        <button 
          @click="handleLogout"
          class="flex items-center justify-center w-full px-4 py-3 text-sm font-black rounded-xl bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white transition-all border border-red-900/30"
        >
          <LogOut class="w-5 h-5 mr-3" />
          LOGOUT
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto bg-gradient-to-br from-[#1a1400] to-[#0d0a00] pt-16 lg:pt-0">
      <header class="hidden lg:block bg-[#0d0a00]/80 backdrop-blur-md border-b border-gold-900/30 px-8 py-5 sticky top-0 z-10">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-black text-gold-500 uppercase tracking-widest">{{ route.name }}</h2>
          <div class="flex items-center space-x-6">
            <div class="px-4 py-1.5 bg-gold-900/20 border border-gold-900/30 rounded-full">
              <span class="text-xs text-gold-500 font-black uppercase tracking-widest">Session: 2023/2024</span>
            </div>
          </div>
        </div>
      </header>
      
      <div class="p-4 md:p-8 max-w-7xl mx-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
