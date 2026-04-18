<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { Search, GraduationCap, Printer, Download, ArrowLeft } from 'lucide-vue-next';
import api from '../api';
import { getOrdinal } from '../utils/helpers';

const route = useRoute();
const schoolSlug = route.params.schoolSlug as string;

const form = ref({
  regNo: '',
  term: 'First',
  session: '2023/2024',
});

const result = ref<any>(null);
const loading = ref(false);
const error = ref('');

const handleCheck = async () => {
  loading.value = true;
  error.value = '';
  result.value = null;
  try {
    const res = await api.post('/results/check', form.value);
    result.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to fetch result';
  } finally {
    loading.value = false;
  }
};

const handlePrint = () => {
  window.print();
};

const terms = ['First', 'Second', 'Third'];
const sessions = ['2023/2024', '2024/2025'];
</script>

<template>
  <div class="min-h-screen bg-[#1a1400] p-4 md:p-8 relative overflow-hidden">
    <!-- Decorative Background -->
    <div class="absolute inset-0 pointer-events-none opacity-[0.03]">
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <pattern id="checker-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="currentColor" stroke-width="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#checker-pattern)" />
      </svg>
    </div>

    <div v-if="!result" class="max-w-md mx-auto pt-20 relative z-10 animate-fade-scale">
      <div class="bg-[#0d0a00] p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gold-900/30 space-y-8 hover:border-gold-500/50 transition-all duration-500">
        <div class="text-center space-y-3">
          <div class="w-20 h-20 bg-gold-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-gold-500/20 mb-6 animate-bounce" style="animation-duration: 4s">
            <GraduationCap class="w-10 h-10 text-black" />
          </div>
          <h1 class="text-2xl font-black text-gold-500 uppercase tracking-widest animate-fade-up stagger-1">Result Checker</h1>
          <p class="text-gold-700 text-[10px] font-black uppercase tracking-[0.3em] animate-fade-up stagger-2">Parent & Student Portal</p>
        </div>

        <form @submit.prevent="handleCheck" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Admission Number</label>
            <input 
              v-model="form.regNo"
              type="text" 
              placeholder="ENTER REG NO" 
              required
              class="w-full px-6 py-4 bg-black/40 border border-gold-900/30 rounded-2xl outline-none focus:border-gold-500 text-gold-100 font-bold tracking-widest text-xs transition-all"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Term</label>
              <select v-model="form.term" class="w-full px-4 py-4 bg-black/40 border border-gold-900/30 rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-xs">
                <option v-for="t in terms" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Session</label>
              <select v-model="form.session" class="w-full px-4 py-4 bg-black/40 border border-gold-900/30 rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-xs">
                <option v-for="s in sessions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <div v-if="error" class="text-red-500 text-[10px] font-black text-center uppercase tracking-widest bg-red-900/10 p-4 rounded-xl border border-red-900/20">
            {{ error }}
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full flex items-center justify-center py-5 bg-gold-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gold-400 transition-all disabled:opacity-50"
          >
            <div v-if="loading" class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
            <Search v-else class="w-5 h-5 mr-3" />
            {{ loading ? 'CHECKING...' : 'CHECK RESULT' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Result Display -->
    <div v-else class="max-w-4xl mx-auto space-y-6">
      <div class="flex justify-between items-center print:hidden">
        <button @click="result = null" class="flex items-center text-gold-500 font-black text-xs uppercase tracking-widest hover:text-gold-400">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Go Back
        </button>
        <button @click="handlePrint" class="flex items-center px-6 py-3 bg-gold-500 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gold-400 shadow-xl shadow-gold-500/10">
          <Printer class="w-4 h-4 mr-2" />
          Print Report Card
        </button>
      </div>

      <div class="bg-white text-black p-8 md:p-12 rounded-[2rem] shadow-2xl space-y-10 border border-gray-200 print:shadow-none print:border-none print:p-0">
        <!-- Header -->
        <div class="text-center space-y-4 border-b-2 border-black pb-8">
          <h1 class="text-4xl font-black uppercase tracking-tighter">{{ result.school.name }}</h1>
          <p v-if="result.school.motto" class="italic font-bold text-gray-600 italic">"{{ result.school.motto }}"</p>
          <p v-if="result.school.address" class="text-sm font-bold uppercase tracking-widest">{{ result.school.address }}</p>
          <div class="inline-block px-6 py-2 bg-black text-white font-black uppercase tracking-widest text-sm rounded-full">
            Terminal Progress Report
          </div>
        </div>

        <!-- Student Info -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] md:text-xs font-black uppercase tracking-widest">
          <div class="space-y-1">
            <p class="text-gray-500">Full Name</p>
            <p class="text-base">{{ result.student.firstName }} {{ result.student.lastName }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-gray-500">Admission No</p>
            <p class="text-base">{{ result.student.regNo }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-gray-500">Class</p>
            <p class="text-base">{{ result.student.class }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-gray-500">Term / Session</p>
            <p class="text-base">{{ result.term }} / {{ result.session }}</p>
          </div>
        </div>

        <!-- Performance Summary -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-2xl border-2 border-black">
          <div class="text-center">
            <p class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Total Score</p>
            <p class="text-2xl font-black">{{ result.totalScore }}</p>
          </div>
          <div class="text-center border-l border-gray-200">
            <p class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Average</p>
            <p class="text-2xl font-black">{{ result.average.toFixed(2) }}%</p>
          </div>
          <div class="text-center border-l border-gray-200">
            <p class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Position</p>
            <p class="text-2xl font-black">{{ result.position }}{{ getOrdinal(result.position) }} / {{ result.totalInClass }}</p>
          </div>
          <div class="text-center border-l border-gray-200">
            <p class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Status</p>
            <p class="text-2xl font-black">{{ result.average >= 40 ? 'PASSED' : 'FAILED' }}</p>
          </div>
        </div>

        <!-- Subjects Table -->
        <div class="overflow-hidden border-2 border-black rounded-2xl">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-black text-white text-[10px] font-black uppercase tracking-widest">
                <th class="px-6 py-4">Subject</th>
                <th class="px-4 py-4 text-center">CA 1 (20)</th>
                <th class="px-4 py-4 text-center">CA 2 (20)</th>
                <th class="px-4 py-4 text-center">Exam (60)</th>
                <th class="px-4 py-4 text-center">Total (100)</th>
                <th class="px-4 py-4 text-center">Grade</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="r in result.results" :key="r.id" class="text-sm font-bold uppercase tracking-widest">
                <td class="px-6 py-4">{{ r.subject.name }}</td>
                <td class="px-4 py-4 text-center">{{ r.ca1 }}</td>
                <td class="px-4 py-4 text-center">{{ r.ca2 }}</td>
                <td class="px-4 py-4 text-center">{{ r.exam }}</td>
                <td class="px-4 py-4 text-center font-black">{{ r.total }}</td>
                <td class="px-4 py-4 text-center">
                  <span class="px-3 py-1 bg-gray-100 rounded-lg">{{ r.grade }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Assessment -->
        <div v-if="result.assessment" class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div class="space-y-4">
            <h4 class="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-2">Affective Domain</h4>
            <div class="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase">
              <div class="flex justify-between"><span>Punctuality:</span> <span>{{ result.assessment.punctuality }}/5</span></div>
              <div class="flex justify-between"><span>Neatness:</span> <span>{{ result.assessment.neatness }}/5</span></div>
              <div class="flex justify-between"><span>Honesty:</span> <span>{{ result.assessment.honesty }}/5</span></div>
              <div class="flex justify-between"><span>Leadership:</span> <span>{{ result.assessment.leadership }}/5</span></div>
              <div class="flex justify-between"><span>Creativity:</span> <span>{{ result.assessment.creativity }}/5</span></div>
            </div>
          </div>
          <div class="space-y-4">
            <h4 class="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-2">Comments</h4>
            <div class="space-y-3 text-xs font-bold uppercase">
              <div>
                <p class="text-[8px] text-gray-500">Class Teacher's Remark</p>
                <p class="italic border-b border-gray-300 pb-1">{{ result.assessment.teacherComment || 'NO COMMENT' }}</p>
              </div>
              <div>
                <p class="text-[8px] text-gray-500">Principal's Remark</p>
                <p class="italic border-b border-gray-300 pb-1">{{ result.assessment.principalComment || 'NO COMMENT' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .bg-[#1a1400] { background: white !important; }
  .p-4, .md\:p-8 { padding: 0 !important; }
  .rounded-\[2rem\] { border-radius: 0 !important; }
}
</style>
