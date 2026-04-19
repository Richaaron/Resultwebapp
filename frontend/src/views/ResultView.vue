<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useResultStore } from '../store';
import { Printer, Download, ChevronLeft, Users, FileDown, TrendingUp } from 'lucide-vue-next';
import type { Student, ResultSummary } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

import { getOrdinal } from '../utils/helpers';

const props = defineProps<{
  id: string;
}>();

const store = useResultStore();
const student = ref<Student | null>(null);
const resultSummary = ref<ResultSummary | null>(null);
const loading = ref(true);
const reportCardRef = ref<HTMLElement | null>(null);
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let performanceChart: Chart | null = null;

const filters = ref({
  term: 'First',
  session: '2023/2024',
});

const initChart = () => {
  if (!chartCanvas.value || !resultSummary.value) return;
  
  if (performanceChart) performanceChart.destroy();

  const labels = resultSummary.value.results.map((r: any) => r.subject?.name);
  const data = resultSummary.value.results.map((r: any) => r.total);

  performanceChart = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Subject Performance',
        data,
        backgroundColor: '#D4AF37',
        borderRadius: 8,
        barThickness: 20,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, max: 100, grid: { display: false } },
        x: { grid: { display: false } }
      }
    }
  });
};

const fetchResult = async () => {
  loading.value = true;
  try {
    const studentData = await store.getStudentById(parseInt(props.id));
    student.value = studentData;
    resultSummary.value = await store.getStudentResult(parseInt(props.id), filters.value.term, filters.value.session);
    await nextTick();
    initChart();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchResult);

const handlePrint = () => {
  window.print();
};

const handleDownloadPDF = () => {
  if (!reportCardRef.value) return;
  
  const element = reportCardRef.value;
  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `${student.value?.firstName}_${student.value?.lastName}_Result_${filters.value.term}_Term.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 3, 
      useCORS: true, 
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };

  html2pdf().from(element).set(opt).save();
};

const getSubjectStat = (subjectId: number, type: 'highest' | 'lowest' | 'average') => {
  const stat = resultSummary.value?.subjectStats?.find((s: any) => s.subjectId === subjectId);
  return stat ? stat[type] : 0;
};

const terms = ['First', 'Second', 'Third'];
</script>

<template>
  <div class="space-y-6 md:space-y-10 max-w-5xl mx-auto pb-20">
    <!-- Actions and Filters -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
      <router-link to="/students" class="flex items-center text-gold-500 hover:text-gold-300 font-black uppercase tracking-widest text-[10px] md:text-xs transition-colors">
        <ChevronLeft class="w-4 h-4 mr-1" />
        Back to Students
      </router-link>
      
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
        <select v-model="filters.term" @change="fetchResult" class="px-5 py-3 bg-darker-bg border border-gold-900/30 rounded-xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-xs md:text-sm">
          <option v-for="t in terms" :key="t" :value="t">{{ t }} Term</option>
        </select>
        <div class="flex items-center gap-3">
          <button @click="handlePrint" class="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-gold-900/20 text-gold-500 border border-gold-500/30 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-black transition-all">
            <Printer class="w-4 h-4 mr-2" />
            Print
          </button>
          <button @click="handleDownloadPDF" class="flex-1 sm:flex-none flex items-center justify-center px-6 md:px-8 py-3 bg-gold-500 text-black rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20">
            <FileDown class="w-4 h-4 mr-2" />
            PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Report Card -->
    <div v-if="student && resultSummary" ref="reportCardRef" class="bg-white p-6 md:p-16 rounded-[1.5rem] md:rounded-[3rem] shadow-2xl border border-gold-900/10 text-black print:shadow-none print:border-0 print:p-0">
      <!-- Header -->
      <div class="bg-darker-bg p-8 md:p-16 text-center relative overflow-hidden border-b-4 border-gold-500 mb-10 md:mb-16">
        <div class="absolute inset-0 opacity-10 pointer-events-none">
          <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="header-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" stroke-width="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#header-pattern)" />
          </svg>
        </div>
        <h1 class="text-2xl md:text-4xl font-black text-black uppercase tracking-[0.1em] md:tracking-[0.2em]">Result Management System</h1>
        <p class="text-[10px] md:text-sm font-black text-gray-500 uppercase tracking-widest">Academic Excellence Tracking Suite</p>
        <div class="mt-4 md:mt-6 inline-block bg-black text-gold-500 px-6 md:px-10 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
          Termly Academic Report
        </div>
      </div>

      <!-- Student Info with Image -->
      <div class="flex flex-col lg:flex-row items-start justify-between gap-10 mb-10 md:mb-16">
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 text-sm w-full">
          <div class="space-y-4">
            <div class="flex flex-col border-b border-gray-100 pb-3">
              <span class="font-black text-gray-400 uppercase text-[8px] md:text-[10px] tracking-widest mb-1">Student Name</span>
              <span class="font-black text-base md:text-lg text-black uppercase">{{ student.firstName }} {{ student.lastName }}</span>
            </div>
            <div class="flex flex-col border-b border-gray-100 pb-3">
              <span class="font-black text-gray-400 uppercase text-[8px] md:text-[10px] tracking-widest mb-1">Admission Number</span>
              <span class="font-black text-base md:text-lg text-black">{{ student.regNo }}</span>
            </div>
          </div>
          <div class="space-y-4">
            <div class="flex flex-col border-b border-gray-100 pb-3">
              <span class="font-black text-gray-400 uppercase text-[8px] md:text-[10px] tracking-widest mb-1">Class & Category</span>
              <span class="font-black text-base md:text-lg text-black uppercase">{{ student.class }} ({{ student.category }})</span>
            </div>
            <div class="flex flex-col border-b border-gray-100 pb-3">
              <span class="font-black text-gray-400 uppercase text-[8px] md:text-[10px] tracking-widest mb-1">Term & Session</span>
              <span class="font-black text-base md:text-lg text-black uppercase">{{ filters.term }} Term / {{ filters.session }}</span>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="flex flex-col border-b border-gray-100 pb-3">
              <span class="font-black text-gray-400 uppercase text-[8px] md:text-[10px] tracking-widest mb-1">Position in Class</span>
              <span class="font-black text-base md:text-lg text-gold-600 uppercase">{{ resultSummary.position }}{{ getOrdinal(resultSummary.position) }} out of {{ resultSummary.totalInClass }}</span>
            </div>
            <div class="flex flex-col border-b border-gray-100 pb-3">
              <span class="font-black text-gray-400 uppercase text-[8px] md:text-[10px] tracking-widest mb-1">Final Average</span>
              <span class="font-black text-base md:text-lg text-black">{{ resultSummary.average.toFixed(2) }}%</span>
            </div>
          </div>
        </div>
        
        <div class="mx-auto lg:ml-12 lg:mr-0 shrink-0">
          <div class="w-32 h-32 md:w-40 md:h-40 rounded-2xl md:rounded-3xl border-4 border-gold-500 overflow-hidden shadow-2xl">
            <img v-if="student.image" :src="student.image" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
              <Users class="w-12 h-12 text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10 md:mb-16">
        <div class="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-2xl border-2 border-black">
          <div class="text-center">
            <p class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Total Score</p>
            <p class="text-2xl font-black">{{ resultSummary.totalScore }}</p>
          </div>
          <div class="text-center border-l border-gray-200">
            <p class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Average</p>
            <p class="text-2xl font-black">{{ resultSummary.average.toFixed(2) }}%</p>
          </div>
          <div class="text-center border-l border-gray-200">
            <p class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Position</p>
            <p class="text-2xl font-black">{{ resultSummary.position }}{{ getOrdinal(resultSummary.position) }}</p>
          </div>
          <div class="text-center border-l border-gray-200">
            <p class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Status</p>
            <p class="text-2xl font-black" :class="resultSummary.average >= 40 ? 'text-green-600' : 'text-red-600'">
              {{ resultSummary.average >= 40 ? 'PASSED' : 'FAILED' }}
            </p>
          </div>
        </div>
        
        <!-- Performance Chart -->
        <div class="bg-black text-white p-4 rounded-2xl border-2 border-black flex flex-col justify-between h-full min-h-[150px]">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[8px] font-black uppercase tracking-widest text-gold-500">Analytics</span>
            <TrendingUp class="w-3 h-3 text-gold-500" />
          </div>
          <div class="flex-1 relative">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Results Table -->
      <div class="mb-10 md:mb-16">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse border-2 border-black min-w-[700px]">
            <thead>
              <tr class="bg-black text-gold-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                <th class="border border-black p-3 md:p-5">Subject</th>
                <th class="border border-black p-3 md:p-5 text-center">CA 1 (20)</th>
                <th class="border border-black p-3 md:p-5 text-center">CA 2 (20)</th>
                <th class="border border-black p-3 md:p-5 text-center">Exam (60)</th>
                <th class="border border-black p-3 md:p-5 text-center">Total (100)</th>
                <th class="border border-black p-3 md:p-5 text-center">Grade</th>
                <th class="border border-black p-3 md:p-5 text-center print:hidden">Class Highest</th>
                <th class="border border-black p-3 md:p-5 text-center print:hidden">Class Average</th>
              </tr>
            </thead>
            <tbody class="text-xs md:text-sm">
              <tr v-for="res in resultSummary.results" :key="res.id" class="border-b border-gray-200">
                <td class="border border-black p-3 md:p-5 font-black uppercase tracking-widest text-[10px] md:text-xs">{{ res.subject?.name }}</td>
                <td class="border border-black p-3 md:p-5 text-center font-bold">{{ res.ca1 }}</td>
                <td class="border border-black p-3 md:p-5 text-center font-bold">{{ res.ca2 }}</td>
                <td class="border border-black p-3 md:p-5 text-center font-bold">{{ res.exam }}</td>
                <td class="border border-black p-3 md:p-5 text-center font-black bg-gray-50 text-base md:text-lg">{{ res.total }}</td>
                <td class="border border-black p-3 md:p-5 text-center font-black text-base md:text-lg" :class="res.grade === 'F' ? 'text-red-600' : 'text-green-700'">
                  {{ res.grade }}
                </td>
                <td class="border border-black p-3 md:p-5 text-center font-bold print:hidden">{{ getSubjectStat(res.subjectId, 'highest') }}</td>
                <td class="border border-black p-3 md:p-5 text-center font-bold print:hidden text-gray-400">{{ getSubjectStat(res.subjectId, 'average').toFixed(1) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-black text-white font-black">
                <td colspan="4" class="border border-black p-4 md:p-6 text-right uppercase text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.2em] text-gold-500">Cumulative Index:</td>
                <td class="border border-black p-4 md:p-6 text-center text-xl md:text-2xl text-gold-500">{{ resultSummary.totalScore }}</td>
                <td class="border border-black p-4 md:p-6 text-center text-[10px] md:text-sm uppercase tracking-widest">AVG: {{ resultSummary.average.toFixed(2) }}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Behavioral and Comments -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-10 md:mb-16">
        <div>
          <h4 class="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-gray-400 border-b-2 border-gold-500 pb-2 inline-block">Affective Domain</h4>
          <div class="space-y-3">
            <div v-for="trait in ['punctuality', 'neatness', 'honesty', 'leadership', 'creativity']" :key="trait" class="flex items-center justify-between text-[10px] md:text-xs border-b border-gray-100 pb-1">
              <span class="font-black uppercase tracking-widest">{{ trait }}</span>
              <div class="flex space-x-1">
                <div v-for="i in 5" :key="i" class="w-4 h-4 border border-black rounded-sm flex items-center justify-center font-black" :class="i <= (resultSummary as any).assessment?.[trait] ? 'bg-black text-gold-500' : ''">
                  {{ i }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="space-y-6 md:space-y-8">
          <div>
            <h4 class="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-gray-400 border-b-2 border-gold-500 pb-2 inline-block">Teacher's Remarks</h4>
            <p class="text-xs md:text-sm italic font-serif leading-relaxed">
              {{ (resultSummary as any).assessment?.teacherComment || 'No comment provided.' }}
            </p>
          </div>
          <div>
            <h4 class="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-gray-400 border-b-2 border-gold-500 pb-2 inline-block">Principal's Remarks</h4>
            <p class="text-xs md:text-sm italic font-serif leading-relaxed">
              {{ (resultSummary as any).assessment?.principalComment || 'Keep up the good work.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer / Signatures -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16 mt-16 md:mt-32 text-center">
        <div class="border-t-2 border-black pt-4 md:pt-6">
          <p class="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Class Teacher</p>
          <div class="h-8 md:h-10 italic font-serif text-base md:text-lg">Folusho Victory</div>
        </div>
        <div class="border-t-2 border-black pt-4 md:pt-6">
          <p class="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">School Principal</p>
          <div class="h-8 md:h-10"></div>
        </div>
        <div class="border-t-2 border-black pt-4 md:pt-6">
          <p class="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Official Stamp</p>
          <div class="h-8 md:h-10"></div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="text-center py-20 md:py-24">
      <div class="animate-spin w-10 h-10 md:w-12 md:h-12 border-4 border-gold-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gold-700 font-black uppercase tracking-widest text-xs">Loading report card...</p>
    </div>

    <div v-else class="text-center py-20 md:py-24 bg-white rounded-2xl border">
      <p class="text-gray-400 font-black uppercase tracking-widest text-xs">No result found for this term.</p>
    </div>
  </div>
</template>

<style>
@media print {
  body {
    background: white !important;
    color: black !important;
  }
  aside, header, .print\:hidden {
    display: none !important;
  }
  main {
    padding: 0 !important;
    background: white !important;
  }
  .max-w-5xl {
    max-width: 100% !important;
  }
  .rounded-\[3rem\] {
    border-radius: 0 !important;
  }
  .shadow-2xl {
    box-shadow: none !important;
  }
  .border-gold-900\/10 {
    border: none !important;
  }
}
</style>
