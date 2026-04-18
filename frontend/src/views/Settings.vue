<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useNotificationStore } from '../store/notifications';
import { School, Save, Plus, Trash2, Sliders } from 'lucide-vue-next';
import api from '../api';

const auth = useAuthStore();
const notifications = useNotificationStore();
const loading = ref(false);

const schoolForm = ref({
  name: auth.user?.school?.name || '',
  motto: auth.user?.school?.motto || '',
  address: auth.user?.school?.address || '',
  logo: auth.user?.school?.logo || '',
  isPublic: true,
});

const gradingScales = ref<any[]>([]);

const fetchSettings = async () => {
  try {
    const res = await api.get('/schools/' + auth.user?.school?.slug);
    schoolForm.value = { ...res.data };
    
    const scalesRes = await api.get('/schools/grading-scales');
    gradingScales.value = scalesRes.data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  fetchSettings();
});

const handleSaveSchool = async () => {
  loading.value = true;
  try {
    await api.patch('/schools', schoolForm.value);
    notifications.success('School settings updated');
    await auth.fetchMe(); // Refresh store
  } catch (err) {
    // Handled by interceptor
  } finally {
    loading.value = false;
  }
};

const addScale = () => {
  gradingScales.value.push({ grade: '', minScore: 0, maxScore: 100, remark: '' });
};

const removeScale = (index: number) => {
  gradingScales.value.splice(index, 1);
};

const handleSaveScales = async () => {
  loading.value = true;
  try {
    await api.put('/schools/grading-scales', { scales: gradingScales.value });
    notifications.success('Grading scales updated');
  } catch (err) {
    // Handled by interceptor
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-10 pb-20">
    <!-- School Profile -->
    <div class="bg-[#0d0a00] p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gold-900/20">
      <div class="flex items-center mb-10">
        <div class="p-4 bg-gold-500 rounded-2xl mr-6 shadow-lg shadow-gold-500/20">
          <School class="w-8 h-8 text-black" />
        </div>
        <div>
          <h3 class="text-2xl font-black text-gold-500 uppercase tracking-widest">School Profile</h3>
          <p class="text-gold-700 text-[10px] font-black uppercase tracking-[0.3em]">Identity & Public Presence</p>
        </div>
      </div>

      <form @submit.prevent="handleSaveSchool" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">School Name</label>
            <input v-model="schoolForm.name" type="text" required class="w-full px-6 py-4 bg-black/40 border border-gold-900/30 rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Motto / Slogan</label>
            <input v-model="schoolForm.motto" type="text" class="w-full px-6 py-4 bg-black/40 border border-gold-900/30 rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-sm" />
          </div>
          <div class="space-y-2 md:col-span-2">
            <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Physical Address</label>
            <input v-model="schoolForm.address" type="text" class="w-full px-6 py-4 bg-black/40 border border-gold-900/30 rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-sm" />
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <input type="checkbox" v-model="schoolForm.isPublic" id="isPublic" class="w-5 h-5 accent-gold-500" />
          <label for="isPublic" class="text-xs font-black text-gold-500 uppercase tracking-widest cursor-pointer">Enable Online Result Checking</label>
        </div>

        <button type="submit" :disabled="loading" class="flex items-center px-8 py-4 bg-gold-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/10">
          <Save class="w-5 h-5 mr-2" />
          Update Profile
        </button>
      </form>
    </div>

    <!-- Grading Scales -->
    <div class="bg-[#0d0a00] p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gold-900/20">
      <div class="flex items-center justify-between mb-10">
        <div class="flex items-center">
          <div class="p-4 bg-gold-500 rounded-2xl mr-6 shadow-lg shadow-gold-500/20">
            <Sliders class="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-gold-500 uppercase tracking-widest">Grading Scales</h3>
            <p class="text-gold-700 text-[10px] font-black uppercase tracking-[0.3em]">Customize Score Ranges</p>
          </div>
        </div>
        <button @click="addScale" class="p-3 bg-gold-900/20 text-gold-500 rounded-xl hover:bg-gold-500 hover:text-black transition-all border border-gold-500/20">
          <Plus class="w-6 h-6" />
        </button>
      </div>

      <div class="space-y-4">
        <div v-for="(scale, index) in gradingScales" :key="index" class="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end bg-black/20 p-6 rounded-2xl border border-gold-900/10">
          <div class="space-y-2">
            <label class="text-[8px] font-black text-gold-800 uppercase tracking-widest">Grade</label>
            <input v-model="scale.grade" type="text" placeholder="A" class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 font-bold outline-none focus:border-gold-500 text-center" />
          </div>
          <div class="space-y-2">
            <label class="text-[8px] font-black text-gold-800 uppercase tracking-widest">Min Score</label>
            <input v-model.number="scale.minScore" type="number" class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 font-bold outline-none focus:border-gold-500 text-center" />
          </div>
          <div class="space-y-2">
            <label class="text-[8px] font-black text-gold-800 uppercase tracking-widest">Max Score</label>
            <input v-model.number="scale.maxScore" type="number" class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 font-bold outline-none focus:border-gold-500 text-center" />
          </div>
          <div class="space-y-2">
            <label class="text-[8px] font-black text-gold-800 uppercase tracking-widest">Remark</label>
            <input v-model="scale.remark" type="text" placeholder="EXCELLENT" class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 font-bold outline-none focus:border-gold-500" />
          </div>
          <button @click="removeScale(index)" class="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex justify-center">
            <Trash2 class="w-6 h-6" />
          </button>
        </div>

        <div v-if="gradingScales.length === 0" class="text-center py-10 border-2 border-dashed border-gold-900/20 rounded-2xl">
          <p class="text-gold-900 text-[10px] font-black uppercase tracking-widest">No custom scales defined. System will use default (A=70, B=60...).</p>
        </div>

        <button @click="handleSaveScales" :disabled="loading" class="w-full mt-6 flex items-center justify-center py-4 bg-gold-500/10 text-gold-500 border border-gold-500/30 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-black transition-all">
          <Save class="w-5 h-5 mr-2" />
          Save Grading Logic
        </button>
      </div>
    </div>
  </div>
</template>
