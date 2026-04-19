<script setup lang="ts">
import { ref } from 'vue';
import { useNotificationStore } from '../store/notifications';
import api from '../api';
import { useRouter } from 'vue-router';
import { School, User, Lock, ArrowRight, GraduationCap, Copy, Check, ExternalLink } from 'lucide-vue-next';

const notifications = useNotificationStore();
const router = useRouter();
const loading = ref(false);
const successData = ref<any>(null);

const form = ref({
  schoolName: '',
  adminName: '',
  username: '',
  password: '',
});

const handleCreate = async () => {
  loading.value = true;
  try {
    const res = await api.post('/schools', form.value);
    successData.value = res.data;
    notifications.success('System initialized successfully!');
  } catch (err: any) {
    // Error handled by interceptor
  } finally {
    loading.value = false;
  }
};

const getSchoolLink = () => {
  if (!successData.value) return '';
  return `${window.location.origin}/${successData.value.school.slug}/login`;
};

const copyLink = () => {
  navigator.clipboard.writeText(getSchoolLink());
  notifications.success('Link copied to clipboard!');
};

const goToLogin = () => {
  router.push(`/${successData.value.school.slug}/login`);
};
</script>

<template>
  <div class="min-h-screen bg-[dark-bg] flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Decorative Academic Background -->
    <div class="absolute inset-0 pointer-events-none opacity-5">
      <svg class="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="academic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M50 20 L80 40 L80 70 L50 90 L20 70 L20 40 Z" fill="none" stroke="currentColor" stroke-width="1" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" stroke-width="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#academic-pattern)" />
      </svg>
    </div>

    <!-- Floating Decorative Icons -->
    <div class="absolute top-20 left-20 text-gold-500/10 animate-pulse hidden lg:block">
      <GraduationCap class="w-32 h-32" />
    </div>
    <div class="absolute bottom-20 right-20 text-gold-500/10 animate-pulse hidden lg:block" style="animation-delay: 1s">
      <Lock class="w-32 h-32" />
    </div>

    <div class="max-w-2xl w-full bg-[darker-bg] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-8 md:p-12 space-y-8 md:space-y-10 border border-gold-900/30 relative z-10 animate-fade-scale">
      <div v-if="!successData">
        <div class="text-center space-y-3">
          <div class="w-16 h-16 md:w-20 md:h-20 bg-gold-500 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-gold-500/20 mb-4 md:mb-6 animate-bounce" style="animation-duration: 3s">
            <GraduationCap class="w-8 h-8 md:w-10 md:h-10 text-black" />
          </div>
          <h1 class="text-2xl md:text-3xl font-black text-gold-500 uppercase tracking-widest animate-fade-up stagger-1">Your System, Your Control</h1>
          <p class="text-gold-700 text-[10px] font-black uppercase tracking-[0.3em] animate-fade-up stagger-2">Initialize your isolated result management suite</p>
        </div>

        <form @submit.prevent="handleCreate" class="space-y-8 animate-fade-up stagger-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4 md:col-span-2">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">School Name</label>
              <div class="relative group">
                <School class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-900 group-focus-within:text-gold-500 transition-colors" />
                <input 
                  v-model="form.schoolName"
                  type="text" 
                  placeholder="E.G. BRIGHT FUTURE ACADEMY" 
                  required
                  class="w-full pl-12 pr-6 py-4 bg-black/40 border border-gold-900/30 rounded-2xl outline-none focus:border-gold-500 text-gold-100 font-bold tracking-widest text-xs transition-all hover:border-gold-500/30"
                />
              </div>
            </div>

            <div class="space-y-4">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Admin Full Name</label>
              <div class="relative group">
                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-900 group-focus-within:text-gold-500 transition-colors" />
                <input 
                  v-model="form.adminName"
                  type="text" 
                  placeholder="ADMIN NAME" 
                  required
                  class="w-full pl-12 pr-6 py-4 bg-black/40 border border-gold-900/30 rounded-2xl outline-none focus:border-gold-500 text-gold-100 font-bold tracking-widest text-xs transition-all hover:border-gold-500/30"
                />
              </div>
            </div>

            <div class="space-y-4">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Admin Username</label>
              <div class="relative group">
                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-900 group-focus-within:text-gold-500 transition-colors" />
                <input 
                  v-model="form.username"
                  type="text" 
                  placeholder="USERNAME" 
                  required
                  class="w-full pl-12 pr-6 py-4 bg-black/40 border border-gold-900/30 rounded-2xl outline-none focus:border-gold-500 text-gold-100 font-bold tracking-widest text-xs transition-all hover:border-gold-500/30"
                />
              </div>
            </div>

            <div class="space-y-4 md:col-span-2">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Admin Password</label>
              <div class="relative group">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-900 group-focus-within:text-gold-500 transition-colors" />
                <input 
                  v-model="form.password"
                  type="password" 
                  placeholder="PASSWORD" 
                  required
                  class="w-full pl-12 pr-6 py-4 bg-black/40 border border-gold-900/30 rounded-2xl outline-none focus:border-gold-500 text-gold-100 font-bold tracking-widest text-xs transition-all hover:border-gold-500/30"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full flex items-center justify-center py-5 bg-gold-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gold-400 transition-all disabled:opacity-50 shadow-xl shadow-gold-500/10 active:scale-[0.98]"
          >
            <div v-if="loading" class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
            <ArrowRight v-else class="w-5 h-5 mr-3" />
            {{ loading ? 'INITIALIZING...' : 'CREATE MY SYSTEM' }}
          </button>
        </form>

        <div class="pt-6 border-t border-gold-900/10 flex flex-col items-center gap-4 animate-fade-up stagger-4">
          <p class="text-gold-700 text-[10px] font-black uppercase tracking-widest">Already have a system?</p>
          <div class="px-4 py-1.5 bg-gold-900/20 rounded-full border border-gold-900/30">
            <span class="text-[8px] text-gold-700 font-black uppercase tracking-[0.4em]">Isolated SQLite Environments</span>
          </div>
        </div>
      </div>

      <!-- Success State -->
      <div v-else class="space-y-10 animate-fade-scale">
        <div class="text-center space-y-4">
          <div class="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20 mb-6">
            <Check class="w-10 h-10 text-black" />
          </div>
          <h1 class="text-2xl md:text-3xl font-black text-gold-500 uppercase tracking-widest">System Ready!</h1>
          <p class="text-gold-700 text-[10px] font-black uppercase tracking-[0.3em]">Your private academic environment is live</p>
        </div>

        <div class="bg-black/40 border border-gold-900/30 rounded-3xl p-6 md:p-8 space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Your Unique Access Link</label>
            <div class="flex gap-2">
              <div class="flex-1 px-5 py-4 bg-black/60 rounded-2xl text-gold-500 font-bold text-xs truncate border border-gold-900/20">
                {{ getSchoolLink() }}
              </div>
              <button @click="copyLink" class="p-4 bg-gold-500/10 text-gold-500 rounded-2xl border border-gold-500/20 hover:bg-gold-500 hover:text-black transition-all">
                <Copy class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gold-900/5 rounded-2xl border border-gold-900/20">
              <p class="text-[8px] font-black text-gold-700 uppercase tracking-widest mb-1">School ID</p>
              <p class="text-xs font-black text-gold-100 uppercase">{{ successData.school.slug }}</p>
            </div>
            <div class="p-4 bg-gold-900/5 rounded-2xl border border-gold-900/20">
              <p class="text-[8px] font-black text-gold-700 uppercase tracking-widest mb-1">Admin User</p>
              <p class="text-xs font-black text-gold-100 uppercase">{{ successData.admin.username }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <button @click="goToLogin" class="w-full flex items-center justify-center py-5 bg-gold-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20">
            Proceed to Login
            <ExternalLink class="w-5 h-5 ml-3" />
          </button>
          <p class="text-center text-[8px] font-black text-gold-900 uppercase tracking-[0.3em]">Bookmark this link to return to your school anytime</p>
        </div>
      </div>
    </div>
  </div>
</template>
