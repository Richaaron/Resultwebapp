<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useResultStore } from '../store';
import { useAuthStore } from '../store/auth';
import { Table, Search, Printer, ChevronLeft, Download } from 'lucide-vue-next';

const store = useResultStore();
const auth = useAuthStore();
const broadsheet = ref<any[]>([]);
const subjects = ref<any[]>([]);
const loading = ref(false);

const filters = ref({
  class: '',
  term: 'First',
  session: '2023/2024',
});

const fetchBroadsheet = async () => {
  if (!filters.value.class) return;
  loading.value = true;
  try {
    const data = await store.getBroadsheet(filters.value);
    broadsheet.value = data.broadsheet;
    subjects.value = data.subjects;
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
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <select v-model="filters.class" @change="fetchBroadsheet" class="px-5 py-3 bg-[#0d0a00] border border-gold-900/30 rounded-xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-xs md:text-sm">
          <option value="">SELECT CLASS</option>
          <option v-for="c in uniqueClasses" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="filters.term" @change="fetchBroadsheet" class="px-5 py-3 bg-[#0d0a00] border border-gold-900/30 rounded-xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-xs md:text-sm">
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

    <div v-if="broadsheet.length > 0" class="bg-[#0d0a00] rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-gold-900/20 overflow-hidden print:bg-white print:border-none print:shadow-none print:rounded-none">
      <div class="p-6 md:p-10 border-b border-gold-900/30 print:text-black">
        <h3 class="text-xl md:text-2xl font-black text-gold-500 uppercase tracking-widest mb-2">Class Broadsheet</h3>
        <p class="text-gold-700 text-[10px] font-black uppercase tracking-[0.3em]">{{ filters.class }} | {{ filters.term }} Term | {{ filters.session }}</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[800px] md:min-w-[1000px]">
          <thead>
            <tr class="bg-gold-900/10 text-gold-700 border-b border-gold-900/30">
              <th class="px-4 md:px-6 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest sticky left-0 bg-[#0d0a00] print:bg-white z-10">Rank</th>
              <th class="px-4 md:px-6 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest sticky left-12 md:left-16 bg-[#0d0a00] print:bg-white z-10 min-w-[150px] md:min-w-[200px]">Student Name</th>
              <th v-for="sub in subjects" :key="sub.id" class="px-3 md:px-4 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-center border-l border-gold-900/10">{{ sub.name }}</th>
              <th class="px-4 md:px-6 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-center border-l border-gold-900/30 bg-gold-900/20">Total</th>
              <th class="px-4 md:px-6 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-center border-l border-gold-900/10 bg-gold-900/20">AVG</th>
            </tr>
          </thead>
          <tbody class="text-gold-100 divide-y divide-gold-900/10 print:text-black">
            <tr v-for="(row, index) in broadsheet" :key="row.id" class="hover:bg-gold-900/5 transition-colors">
              <td class="px-4 md:px-6 py-4 md:py-5 font-black text-gold-500 sticky left-0 bg-[#0d0a00] print:bg-white text-xs md:text-base">{{ index + 1 }}</td>
              <td class="px-4 md:px-6 py-4 md:py-5 font-bold sticky left-12 md:left-16 bg-[#0d0a00] print:bg-white truncate text-xs md:text-base">{{ row.fullName }}</td>
              <td v-for="sub in subjects" :key="sub.id" class="px-3 md:px-4 py-4 md:py-5 text-center border-l border-gold-900/10">
                <div class="flex flex-col">
                  <span class="font-black text-xs md:text-base">{{ row.results[sub.id]?.total || '-' }}</span>
                  <span class="text-[8px] text-gold-700 font-black">{{ row.results[sub.id]?.grade || '' }}</span>
                </div>
              </td>
              <td class="px-4 md:px-6 py-4 md:py-5 text-center font-black border-l border-gold-900/30 bg-gold-900/10 text-gold-500 text-xs md:text-base">{{ row.totalScore }}</td>
              <td class="px-4 md:px-6 py-4 md:py-5 text-center font-black border-l border-gold-900/10 bg-gold-900/10 text-xs md:text-base">{{ row.average.toFixed(1) }}%</td>
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
