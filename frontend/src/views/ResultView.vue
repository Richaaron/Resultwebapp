<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useResultStore } from '../store';
import { Printer, Download, ChevronLeft } from 'lucide-vue-next';
import type { Student, ResultSummary } from '../types';

const props = defineProps<{
  id: string;
}>();

const store = useResultStore();
const student = ref<Student | null>(null);
const resultSummary = ref<ResultSummary | null>(null);
const loading = ref(true);

const filters = ref({
  term: 'First',
  session: '2023/2024',
});

const fetchResult = async () => {
  loading.value = true;
  try {
    const studentData = await store.getStudentById(parseInt(props.id));
    student.value = studentData;
    resultSummary.value = await store.getStudentResult(parseInt(props.id), filters.value.term, filters.value.session);
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

const terms = ['First', 'Second', 'Third'];
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Actions and Filters -->
    <div class="flex justify-between items-center print:hidden">
      <router-link to="/students" class="flex items-center text-gray-600 hover:text-gray-900">
        <ChevronLeft class="w-4 h-4 mr-1" />
        Back to Students
      </router-link>
      
      <div class="flex items-center space-x-4">
        <select v-model="filters.term" @change="fetchResult" class="px-3 py-2 border rounded-lg outline-none">
          <option v-for="t in terms" :key="t" :value="t">{{ t }} Term</option>
        </select>
        <button @click="handlePrint" class="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors">
          <Printer class="w-4 h-4 mr-2" />
          Print Report
        </button>
      </div>
    </div>

    <!-- Report Card -->
    <div v-if="student && resultSummary" class="bg-white p-12 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-0 print:p-0">
      <!-- Header -->
      <div class="text-center space-y-2 mb-12 border-b-2 border-primary-600 pb-8">
        <h1 class="text-3xl font-black text-primary-900 uppercase tracking-widest">Folusho Victory Schools</h1>
        <p class="text-sm font-bold text-gray-600 uppercase">Motto: Excellence through Diligence</p>
        <p class="text-xs text-gray-500 italic">P.O. Box 123, School Road, Nigeria</p>
        <div class="mt-4 inline-block bg-primary-600 text-white px-6 py-1 rounded-full text-sm font-bold uppercase tracking-widest">
          Termly Academic Report
        </div>
      </div>

      <!-- Student Info -->
      <div class="grid grid-cols-2 gap-8 mb-12 text-sm">
        <div class="space-y-3">
          <div class="flex border-b border-gray-100 pb-2">
            <span class="w-32 font-bold text-gray-500 uppercase text-xs">Student Name:</span>
            <span class="font-bold text-gray-900">{{ student.firstName }} {{ student.lastName }}</span>
          </div>
          <div class="flex border-b border-gray-100 pb-2">
            <span class="w-32 font-bold text-gray-500 uppercase text-xs">Admission No:</span>
            <span class="font-bold text-gray-900">{{ student.regNo }}</span>
          </div>
        </div>
        <div class="space-y-3">
          <div class="flex border-b border-gray-100 pb-2">
            <span class="w-32 font-bold text-gray-500 uppercase text-xs">Class:</span>
            <span class="font-bold text-gray-900">{{ student.class }} ({{ student.category }})</span>
          </div>
          <div class="flex border-b border-gray-100 pb-2">
            <span class="w-32 font-bold text-gray-500 uppercase text-xs">Term/Session:</span>
            <span class="font-bold text-gray-900">{{ filters.term }} Term / {{ filters.session }}</span>
          </div>
        </div>
      </div>

      <!-- Results Table -->
      <div class="mb-12">
        <table class="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100 text-xs font-bold uppercase text-gray-700">
              <th class="border border-gray-300 p-3">Subject</th>
              <th class="border border-gray-300 p-3 text-center">CA 1 (20)</th>
              <th class="border border-gray-300 p-3 text-center">CA 2 (20)</th>
              <th class="border border-gray-300 p-3 text-center">Exam (60)</th>
              <th class="border border-gray-300 p-3 text-center">Total (100)</th>
              <th class="border border-gray-300 p-3 text-center">Grade</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="res in resultSummary.results" :key="res.id">
              <td class="border border-gray-300 p-3 font-medium">{{ res.subject?.name }}</td>
              <td class="border border-gray-300 p-3 text-center">{{ res.ca1 }}</td>
              <td class="border border-gray-300 p-3 text-center">{{ res.ca2 }}</td>
              <td class="border border-gray-300 p-3 text-center font-semibold">{{ res.exam }}</td>
              <td class="border border-gray-300 p-3 text-center font-bold bg-gray-50">{{ res.total }}</td>
              <td class="border border-gray-300 p-3 text-center font-bold" :class="res.grade === 'F9' || res.grade === 'FAIL' || res.grade === 'F' ? 'text-red-600' : 'text-green-700'">
                {{ res.grade }}
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-primary-50">
            <tr class="font-bold">
              <td colspan="4" class="border border-gray-300 p-3 text-right uppercase text-xs tracking-wider">Total Cumulative Score:</td>
              <td class="border border-gray-300 p-3 text-center text-lg">{{ resultSummary.totalScore }}</td>
              <td class="border border-gray-300 p-3 text-center text-sm">AVG: {{ resultSummary.average.toFixed(2) }}%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Footer / Signatures -->
      <div class="grid grid-cols-3 gap-12 mt-24 text-center">
        <div class="border-t border-gray-400 pt-4">
          <p class="text-xs font-bold uppercase text-gray-500">Class Teacher</p>
        </div>
        <div class="border-t border-gray-400 pt-4">
          <p class="text-xs font-bold uppercase text-gray-500">Principal</p>
        </div>
        <div class="border-t border-gray-400 pt-4">
          <p class="text-xs font-bold uppercase text-gray-500">Parent/Guardian</p>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="text-center py-24">
      <div class="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500 font-medium">Loading report card...</p>
    </div>

    <div v-else class="text-center py-24 bg-white rounded-xl border">
      <p class="text-gray-400">No result found for this term.</p>
    </div>
  </div>
</template>

<style>
@media print {
  body {
    background: white;
  }
  aside, header {
    display: none !important;
  }
  main {
    padding: 0 !important;
  }
  .max-w-5xl {
    max-width: 100% !important;
  }
}
</style>
