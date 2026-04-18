<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useResultStore } from '../store';
import { useAuthStore } from '../store/auth';
import { Table, Search, Printer, ChevronLeft, Download } from 'lucide-vue-next';
import { getOrdinal } from '../utils/helpers';

const store = useResultStore();
const auth = useAuthStore();
const broadsheet = ref<any[]>([]);
const subjects = ref<any[]>([]);
const loading = ref(false);
const viewMode = ref<'term' | 'cumulative'>('term');

const filters = ref({
  class: '',
  term: 'First',
  session: '2023/2024',
});

const fetchBroadsheet = async () => {
  if (!filters.value.class) return;
  loading.value = true;
  try {
    if (viewMode.value === 'term') {
      const data = await store.getBroadsheet(filters.value);
      broadsheet.value = data.broadsheet;
      subjects.value = data.subjects;
    } else {
      const data = await store.getCumulativeBroadsheet({
        class: filters.value.class,
        session: filters.value.session
      });
      broadsheet.value = data.cumulativeData;
      subjects.value = data.subjects;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  store.fetchStudents();
});

const uniqueClasses = computed(() => {
  const classes = store.students.map(s => s.class);
  return [...new Set(classes)].sort();
});

const terms = ['First', 'Second', 'Third'];
const sessions = ['2023/2024', '2024/2025'];

const handlePrint = () => {
  window.print();
};

const handleDownloadCSV = () => {
  const params = new URLSearchParams(filters.value);
  const url = `http://localhost:5000/api/reports/broadsheet/export?${params.toString()}`;
  window.open(url, '_blank');
};
</script>

<template>
  <div class="space-y-6 md:space-y-10">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 print:hidden">
      <div>
        <h3 class="text-xl md:text-3xl font-black text-gold-500 uppercase tracking-widest">Academic Broadsheet</h3>
        <p class="text-gold-700 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Class-wide performance records</p>
      </div>
      
      <!-- View Mode Switcher -->
      <div class="flex p-1 bg-gold-900/10 rounded-xl border border-gold-900/20">
        <button 
          @click="viewMode = 'term'; fetchBroadsheet()"
          :class="[
            'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
            viewMode === 'term' ? 'bg-gold-500 text-black' : 'text-gold-700 hover:text-gold-500'
          ]"
        >
          Termly
        </button>
        <button 
          @click="viewMode = 'cumulative'; fetchBroadsheet()"
          :class="[
            'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
            viewMode === 'cumulative' ? 'bg-gold-500 text-black' : 'text-gold-700 hover:text-gold-500'
          ]"
        >
          Cumulative
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-[#0d0a00] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-gold-900/20 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 print:hidden">
      <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">
        <div class="relative min-w-[150px]">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-900" />
          <select v-model="filters.class" @change="fetchBroadsheet" class="w-full pl-12 pr-6 py-3 bg-[#0d0a00] border border-gold-900/30 rounded-xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-xs md:text-sm appearance-none">
            <option value="">SELECT CLASS</option>
            <option v-for="c in uniqueClasses" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <select v-if="viewMode === 'term'" v-model="filters.term" @change="fetchBroadsheet" class="px-5 py-3 bg-[#0d0a00] border border-gold-900/30 rounded-xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-xs md:text-sm">
          <option v-for="t in terms" :key="t" :value="t">{{ t }} Term</option>
        </select>
      </div>

      <div v-if="broadsheet.length > 0" class="flex items-center gap-3 w-full md:w-auto">
        <button @click="handleDownloadCSV" class="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-gold-900/10 text-gold-500 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-black transition-all border border-gold-500/20">
          <Download class="w-4 h-4 mr-2" />
          CSV
        </button>
        <button @click="handlePrint" class="flex-1 md:flex-none flex items-center justify-center px-6 md:px-8 py-3 bg-gold-500 text-black rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-gold-400 transition-all">
          <Printer class="w-4 h-4 mr-2" />
          Print
        </button>
      </div>
    </div>

    <!-- Broadsheet Table -->
    <div v-if="broadsheet.length > 0" class="bg-[#0d0a00] rounded-[2rem] shadow-2xl border border-gold-900/20 overflow-hidden animate-fade-up">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gold-500 text-black text-[10px] font-black uppercase tracking-widest">
              <th class="px-6 py-5 border-r border-black/10">Student</th>
              <th v-for="subject in subjects" :key="subject.id" class="px-4 py-5 text-center border-r border-black/10 min-w-[100px]">
                {{ subject.name }}
                <div v-if="viewMode === 'cumulative'" class="flex justify-center gap-1 mt-1 text-[7px] opacity-60">
                  <span>1ST</span><span>2ND</span><span>3RD</span><span>AVG</span>
                </div>
              </th>
              <th class="px-6 py-5 text-center">
                {{ viewMode === 'term' ? 'Total' : 'Session Avg' }}
              </th>
              <th class="px-6 py-5 text-center">Rank</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gold-900/10 text-gold-100">
            <tr v-for="(row, index) in broadsheet" :key="row.id" class="hover:bg-gold-500/5 transition-colors group">
              <td class="px-6 py-4 border-r border-gold-900/10 min-w-[200px]">
                <div class="font-black text-xs">{{ row.fullName }}</div>
                <div class="text-[8px] text-gold-700 font-bold tracking-widest mt-0.5">{{ row.regNo }}</div>
              </td>
              
              <td v-for="subject in subjects" :key="subject.id" class="px-4 py-4 text-center border-r border-gold-900/10">
                <template v-if="viewMode === 'term'">
                  <span class="font-bold text-xs">{{ row.results[subject.id] || '-' }}</span>
                </template>
                <template v-else>
                  <div class="flex items-center justify-center gap-2">
                    <div class="grid grid-cols-4 gap-1 w-full max-w-[120px]">
                      <span class="text-[9px] text-gold-700">{{ row.subjectData[subject.id]?.first || 0 }}</span>
                      <span class="text-[9px] text-gold-700">{{ row.subjectData[subject.id]?.second || 0 }}</span>
                      <span class="text-[9px] text-gold-700">{{ row.subjectData[subject.id]?.third || 0 }}</span>
                      <span class="text-[10px] font-black text-gold-400">{{ (row.subjectData[subject.id]?.average || 0).toFixed(0) }}</span>
                    </div>
                  </div>
                </template>
              </td>

              <td class="px-6 py-4 text-center font-black text-gold-500 bg-gold-500/5">
                {{ viewMode === 'term' ? row.totalScore : (row.sessionAverage || 0).toFixed(2) + '%' }}
              </td>
              <td class="px-6 py-4 text-center">
                <span class="inline-block px-3 py-1 rounded-full bg-gold-900/20 text-gold-500 font-black text-[10px]">
                  {{ index + 1 }}{{ getOrdinal(index + 1) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="loading" class="text-center py-20 px-6">
      <div class="animate-spin w-10 h-10 md:w-12 md:h-12 border-4 border-gold-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gold-800 font-black uppercase tracking-widest text-xs md:text-sm">Generating broadsheet...</p>
    </div>

    <div v-else class="text-center py-20 md:py-40 bg-[#0d0a00] rounded-[1.5rem] md:rounded-[2rem] border border-gold-900/20 px-6">
      <Table class="w-12 h-12 md:w-16 md:h-16 text-gold-900 mx-auto mb-6" />
      <h3 class="text-lg md:text-xl font-black text-gold-800 uppercase tracking-widest mb-2">Broadsheet Generator</h3>
      <p class="text-gold-900 text-[10px] md:text-xs font-bold uppercase tracking-widest">Select a class to view the full performance grid.</p>
    </div>
  </div>
</template>

<style>
@media print {
  body { background: white !important; color: black !important; }
  aside, header, .print\:hidden { display: none !important; }
  main { padding: 0 !important; background: white !important; }
  table { font-size: 8px !important; }
  th, td { padding: 4px !important; }
  .sticky { position: static !important; }
}
</style>
