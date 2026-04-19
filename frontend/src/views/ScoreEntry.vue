<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useResultStore } from '../store';
import { useAuthStore } from '../store/auth';
import { useNotificationStore } from '../store/notifications';
import { Save, AlertCircle, TrendingUp, Upload, Download } from 'lucide-vue-next';

const store = useResultStore();
const auth = useAuthStore();
const notifications = useNotificationStore();

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

const assessment = ref({
  punctuality: 5,
  neatness: 5,
  honesty: 5,
  leadership: 5,
  creativity: 5,
  teacherComment: '',
  principalComment: '',
  attendance: 0,
  totalDays: 90,
});

const totalScore = computed(() => (scores.value.ca1 || 0) + (scores.value.ca2 || 0) + (scores.value.exam || 0));

const currentGrade = computed(() => {
  const total = totalScore.value;
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 45) return 'D';
  if (total >= 40) return 'E';
  return 'F';
});

onMounted(() => {
  store.fetchStudents();
  store.fetchSubjects();
});

watch([() => filters.value.studentId, () => filters.value.term, () => filters.value.session], async ([sId, t, s]) => {
  if (sId) {
    const data = await store.getAssessment(sId, t, s);
    if (data.id) {
      assessment.value = { ...data };
    } else {
      assessment.value = {
        punctuality: 5,
        neatness: 5,
        honesty: 5,
        leadership: 5,
        creativity: 5,
        teacherComment: '',
        principalComment: '',
        attendance: 0,
        totalDays: 90,
      };
    }
  }
});

const filteredStudents = computed(() => {
  if (auth.isAdmin) return store.students;
  const assignments = auth.user?.assignments || [];
  return store.students.filter(student => {
    return assignments.some((a: any) => {
      const classMatch = !a.class || a.class === student.class;
      const categoryMatch = !a.category || a.category === student.category;
      return classMatch && categoryMatch;
    });
  });
});

const filteredSubjects = computed(() => {
  if (auth.isAdmin) return store.subjects;
  const assignments = auth.user?.assignments || [];
  
  // If teacher is assigned to specific subjects, filter those. 
  // If subjectId is null in assignment, it means they teach all subjects in that class/category.
  const specificSubjectIds = assignments.map((a: any) => a.subjectId).filter(Boolean);
  if (specificSubjectIds.length > 0 && assignments.every((a: any) => a.subjectId)) {
    return store.subjects.filter(s => specificSubjectIds.includes(s.id));
  }
  return store.subjects;
});

const handleSave = async () => {
  if (!filters.value.studentId || !filters.value.subjectId) {
    notifications.error('Please select a student and a subject');
    return;
  }

  try {
    // Save Score
    await store.upsertResult({
      studentId: filters.value.studentId,
      subjectId: filters.value.subjectId,
      term: filters.value.term,
      session: filters.value.session,
      ...scores.value,
    });

    // Save Assessment
    await store.upsertAssessment({
      studentId: filters.value.studentId,
      term: filters.value.term,
      session: filters.value.session,
      ...assessment.value,
    });

    notifications.success('Records saved successfully!');
  } catch (err) {
    // Error notification handled by interceptor
  }
};

const downloadTemplate = () => {
  const headers = 'regNo,subjectName,ca1,ca2,exam';
  const example = 'REG001,Mathematics,15,12,45';
  const blob = new Blob([`${headers}\n${example}`], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'score_upload_template.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const handleBulkUpload = async (event: any) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e: any) => {
    const text = e.target.result;
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    const data = lines.slice(1).filter((l: string) => l.trim()).map((line: string) => {
      const values = line.split(',');
      const item: any = {};
      headers.forEach((h: string, i: number) => {
        item[h.trim()] = values[i]?.trim();
      });
      return item;
    });

    try {
      await api.post('/results/bulk', {
        results: data,
        term: filters.value.term,
        session: filters.value.session
      });
      notifications.success('Bulk upload successful!');
    } catch (err) {
      // Handled by interceptor
    }
  };
  reader.readAsText(file);
};

const terms = ['First', 'Second', 'Third'];
const sessions = ['2023/2024', '2024/2025'];
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 md:space-y-10">
    <div class="bg-[darker-bg] p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-gold-900/20 relative overflow-hidden">
      <div class="absolute top-0 right-0 p-4 md:p-8">
        <FileEdit class="w-10 h-10 md:w-16 md:h-16 text-gold-900/20" />
      </div>
      
      <h3 class="text-xl md:text-2xl font-black text-gold-500 uppercase tracking-widest mb-6 md:mb-10">Academic Record Entry</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
        <div class="space-y-2">
          <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Select Student</label>
          <select v-model="filters.studentId" class="w-full px-4 md:px-5 py-3 md:py-4 bg-black/40 border border-gold-900/30 rounded-xl md:rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-sm md:text-base">
            <option v-for="student in filteredStudents" :key="student.id" :value="student.id">
              {{ student.firstName }} {{ student.lastName }} ({{ student.regNo }})
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Select Subject</label>
          <select v-model="filters.subjectId" class="w-full px-4 md:px-5 py-3 md:py-4 bg-black/40 border border-gold-900/30 rounded-xl md:rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-sm md:text-base">
            <option v-for="subject in filteredSubjects" :key="subject.id" :value="subject.id">
              {{ subject.name }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Academic Term</label>
          <select v-model="filters.term" class="w-full px-4 md:px-5 py-3 md:py-4 bg-black/40 border border-gold-900/30 rounded-xl md:rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-sm md:text-base">
            <option v-for="term in terms" :key="term" :value="term">{{ term }} Term</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Academic Session</label>
          <select v-model="filters.session" class="w-full px-4 md:px-5 py-3 md:py-4 bg-black/40 border border-gold-900/30 rounded-xl md:rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-sm md:text-base">
            <option v-for="s in sessions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <div class="bg-black/60 p-6 md:p-10 rounded-2xl md:rounded-3xl border border-gold-900/20 shadow-inner">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10">
          <div class="space-y-3">
            <label class="text-[10px] font-black text-gold-800 uppercase tracking-[0.2em] text-center block">CA 1 (20%)</label>
            <input v-model.number="scores.ca1" type="number" max="20" min="0" class="w-full px-4 md:px-6 py-3 md:py-5 text-2xl md:text-4xl font-black bg-gold-900/10 border-2 border-gold-900/30 rounded-xl md:rounded-2xl text-gold-500 text-center focus:border-gold-500 outline-none transition-all shadow-lg" />
          </div>
          <div class="space-y-3">
            <label class="text-[10px] font-black text-gold-800 uppercase tracking-[0.2em] text-center block">CA 2 (20%)</label>
            <input v-model.number="scores.ca2" type="number" max="20" min="0" class="w-full px-4 md:px-6 py-3 md:py-5 text-2xl md:text-4xl font-black bg-gold-900/10 border-2 border-gold-900/30 rounded-xl md:rounded-2xl text-gold-500 text-center focus:border-gold-500 outline-none transition-all shadow-lg" />
          </div>
          <div class="space-y-3">
            <label class="text-[10px] font-black text-gold-800 uppercase tracking-[0.2em] text-center block">Exam (60%)</label>
            <input v-model.number="scores.exam" type="number" max="60" min="0" class="w-full px-4 md:px-6 py-3 md:py-5 text-2xl md:text-4xl font-black bg-gold-900/10 border-2 border-gold-900/30 rounded-xl md:rounded-2xl text-gold-500 text-center focus:border-gold-500 outline-none transition-all shadow-lg" />
          </div>
        </div>

        <div class="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 bg-gold-900/20 rounded-xl md:rounded-2xl border border-gold-500/20 shadow-xl gap-4">
          <div class="flex flex-col items-center sm:items-start">
            <div class="flex items-center text-gold-500 mb-1">
              <TrendingUp class="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
              <span class="text-lg md:text-xl font-black tracking-tighter uppercase">Total: {{ totalScore }} / 100</span>
            </div>
            <div class="flex items-center">
              <span class="text-[10px] font-black text-gold-700 uppercase tracking-widest mr-2">Automatic Grade:</span>
              <span class="text-xl md:text-2xl font-black text-gold-100" :class="currentGrade === 'F' ? 'text-red-500' : 'text-gold-100'">{{ currentGrade }}</span>
            </div>
          </div>
          <button 
            @click="handleSave"
            class="w-full sm:w-auto flex items-center justify-center px-10 py-4 bg-gold-500 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 active:scale-[0.98]"
          >
            <Save class="w-5 h-5 mr-3" />
            Commit Record
          </button>
      </div>

      <!-- Bulk Upload Section -->
      <div v-if="auth.isAdmin" class="mt-8 pt-8 border-t border-gold-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 class="text-xs font-black text-gold-500 uppercase tracking-widest mb-1">Bulk Upload Scores</h4>
          <p class="text-[10px] text-gold-700 font-bold uppercase tracking-widest">Upload results for multiple students at once</p>
        </div>
        <div class="flex items-center gap-4 w-full md:w-auto">
          <button @click="downloadTemplate" class="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-gold-900/10 text-gold-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-500 hover:text-black transition-all border border-gold-500/20">
            <Download class="w-4 h-4 mr-2" />
            Template
          </button>
          <label class="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-gold-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-400 transition-all cursor-pointer">
            <Upload class="w-4 h-4 mr-2" />
            Upload CSV
            <input type="file" @change="handleBulkUpload" class="hidden" accept=".csv" />
          </label>
        </div>
      </div>
    </div>

      <div class="mt-8 md:mt-10 flex items-center justify-center space-x-3 px-4 text-center">
        <AlertCircle class="w-5 h-5 text-gold-700 shrink-0" />
        <p class="text-[10px] font-black text-gold-800 uppercase tracking-widest leading-relaxed">Authorized data entry only. All changes are logged.</p>
      </div>
    </div>

    <!-- Behavioral Assessment -->
    <div class="bg-[darker-bg] p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-gold-900/20">
      <h3 class="text-xl md:text-2xl font-black text-gold-500 uppercase tracking-widest mb-8 md:mb-10">Behavioral Assessment</h3>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
        <div v-for="trait in ['punctuality', 'neatness', 'honesty', 'leadership', 'creativity']" :key="trait" class="space-y-2">
          <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">{{ trait }} (1-5)</label>
          <input 
            v-model.number="assessment[trait as keyof typeof assessment]" 
            type="number" min="1" max="5" 
            class="w-full px-4 md:px-5 py-3 md:py-4 bg-black/40 border border-gold-900/30 rounded-xl md:rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-sm md:text-base" 
          />
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Attendance (Days)</label>
          <input v-model.number="assessment.attendance" type="number" class="w-full px-4 md:px-5 py-3 md:py-4 bg-black/40 border border-gold-900/30 rounded-xl md:rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-sm md:text-base" />
        </div>
      </div>

      <div class="space-y-4 md:space-y-6">
        <div class="space-y-2">
          <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Teacher's Comment</label>
          <textarea v-model="assessment.teacherComment" rows="3" class="w-full px-4 md:px-5 py-3 md:py-4 bg-black/40 border border-gold-900/30 rounded-xl md:rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all resize-none text-sm md:text-base"></textarea>
        </div>
        <div v-if="auth.isAdmin" class="space-y-2">
          <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Principal's Comment</label>
          <textarea v-model="assessment.principalComment" rows="3" class="w-full px-4 md:px-5 py-3 md:py-4 bg-black/40 border border-gold-900/30 rounded-xl md:rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all resize-none text-sm md:text-base"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
