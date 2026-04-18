<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useResultStore } from '../store';
import { Save, AlertCircle } from 'lucide-vue-next';

const store = useResultStore();

const filters = ref({
  studentId: null as number | null,
  subjectId: null as number | null,
  term: 'First',
  session: '2023/2024',
});

const scores = ref({
  ca1: 0,
  ca2: 0,
  exam: 0,
});

onMounted(() => {
  store.fetchStudents();
  store.fetchSubjects();
});

const handleSave = async () => {
  if (!filters.value.studentId || !filters.value.subjectId) {
    alert('Please select a student and a subject');
    return;
  }

  try {
    await store.upsertResult({
      studentId: filters.value.studentId,
      subjectId: filters.value.subjectId,
      term: filters.value.term,
      session: filters.value.session,
      ...scores.value,
    });
    alert('Score saved successfully!');
  } catch (err) {
    alert('Failed to save score');
  }
};

const terms = ['First', 'Second', 'Third'];
const sessions = ['2023/2024', '2024/2025'];
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h3 class="text-xl font-bold mb-6">Enter Student Scores</h3>
      
      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Select Student</label>
          <select v-model="filters.studentId" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
            <option v-for="student in store.students" :key="student.id" :value="student.id">
              {{ student.firstName }} {{ student.lastName }} ({{ student.regNo }})
            </option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Select Subject</label>
          <select v-model="filters.subjectId" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
            <option v-for="subject in store.subjects" :key="subject.id" :value="subject.id">
              {{ subject.name }}
            </option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Term</label>
          <select v-model="filters.term" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
            <option v-for="term in terms" :key="term" :value="term">{{ term }} Term</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Session</label>
          <select v-model="filters.session" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
            <option v-for="s in sessions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <div class="bg-gray-50 p-8 rounded-xl border border-gray-200">
        <div class="grid grid-cols-3 gap-8">
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-600 uppercase tracking-wider">CA 1 (20%)</label>
            <input v-model.number="scores.ca1" type="number" max="20" min="0" class="w-full px-4 py-3 text-2xl font-bold border rounded-xl text-center focus:ring-4 focus:ring-primary-100 outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-600 uppercase tracking-wider">CA 2 (20%)</label>
            <input v-model.number="scores.ca2" type="number" max="20" min="0" class="w-full px-4 py-3 text-2xl font-bold border rounded-xl text-center focus:ring-4 focus:ring-primary-100 outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-600 uppercase tracking-wider">Exam (60%)</label>
            <input v-model.number="scores.exam" type="number" max="60" min="0" class="w-full px-4 py-3 text-2xl font-bold border rounded-xl text-center focus:ring-4 focus:ring-primary-100 outline-none" />
          </div>
        </div>

        <div class="mt-8 flex items-center justify-between p-4 bg-white rounded-lg border border-primary-100">
          <div class="flex items-center text-primary-700">
            <TrendingUp class="w-5 h-5 mr-2" />
            <span class="font-bold">Total Score: {{ scores.ca1 + scores.ca2 + scores.exam }}/100</span>
          </div>
          <button 
            @click="handleSave"
            class="flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            <Save class="w-5 h-5 mr-2" />
            Save Result
          </button>
        </div>
      </div>

      <div class="mt-6 flex items-start space-x-2 text-sm text-gray-500">
        <AlertCircle class="w-4 h-4 mt-0.5 text-orange-500" />
        <p>Ensure all scores are accurate before saving. The system will automatically compute the grade based on the school's standards.</p>
      </div>
    </div>
  </div>
</template>
