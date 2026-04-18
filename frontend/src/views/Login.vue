<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { LogIn, Lock, User as UserIcon } from 'lucide-vue-next';

const auth = useAuthStore();
const router = useRouter();

const credentials = ref({
  username: '',
  password: '',
});

const handleLogin = async () => {
  try {
    await auth.login(credentials.value);
    router.push('/');
  } catch (err) {
    // Error handled in store
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#1a1400] flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-[#0d0a00] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-8 md:p-12 space-y-8 md:space-y-10 border border-gold-900/30">
      <div class="text-center space-y-3">
        <div class="w-16 h-16 md:w-20 md:h-20 bg-gold-500 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-gold-500/20 mb-4 md:mb-6">
          <Lock class="w-8 h-8 md:w-10 md:h-10 text-black" />
        </div>
        <h1 class="text-2xl md:text-3xl font-black text-gold-500 uppercase tracking-widest">Result System</h1>
        <p class="text-gold-700 text-[10px] font-black uppercase tracking-[0.3em]">Secure Management Portal</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-8">
        <div class="space-y-4">
          <div class="relative group">
            <UserIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-900 group-focus-within:text-gold-500 transition-colors" />
            <input 
              v-model="credentials.username"
              type="text" 
              placeholder="USERNAME" 
              required
              class="w-full pl-12 pr-6 py-4 bg-black/40 border border-gold-900/30 rounded-2xl outline-none focus:border-gold-500 text-gold-100 font-bold tracking-widest text-xs transition-all"
            />
          </div>
          <div class="relative group">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-900 group-focus-within:text-gold-500 transition-colors" />
            <input 
              v-model="credentials.password"
              type="password" 
              placeholder="PASSWORD" 
              required
              class="w-full pl-12 pr-6 py-4 bg-black/40 border border-gold-900/30 rounded-2xl outline-none focus:border-gold-500 text-gold-100 font-bold tracking-widest text-xs transition-all"
            />
          </div>
        </div>

        <div v-if="auth.error" class="text-red-500 text-[10px] font-black text-center uppercase tracking-widest bg-red-900/10 p-4 rounded-xl border border-red-900/20">
          {{ auth.error }}
        </div>

        <button 
          type="submit" 
          :disabled="auth.loading"
          class="w-full flex items-center justify-center py-5 bg-gold-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gold-400 transition-all disabled:opacity-50 shadow-xl shadow-gold-500/10 active:scale-[0.98]"
        >
          <LogIn v-if="!auth.loading" class="w-5 h-5 mr-3" />
          <div v-else class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
          {{ auth.loading ? 'AUTHENTICATING...' : 'ENTER SYSTEM' }}
        </button>
      </form>

      <div class="pt-6 border-t border-gold-900/10 flex justify-center">
        <div class="px-4 py-1.5 bg-gold-900/20 rounded-full border border-gold-900/30">
          <span class="text-[8px] text-gold-700 font-black uppercase tracking-[0.4em]">Protected by AES-256</span>
        </div>
      </div>
    </div>
  </div>
</template>
