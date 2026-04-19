<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';
import { useResultStore } from '../store';
import { Plus, Trash2, BookOpen, Search } from 'lucide-vue-next';

const store = useResultStore();
const subjects = ref<any[]>([]);
const newSubjectName = ref('');
const searchQuery = ref('');

const fetchSubjects = async () => {
  const res = await api.get('/subjects');
  subjects.value = res.data;
};

onMounted(fetchSubjects);

const handleAddSubject = async () => {
  if (!newSubjectName.value) return;
  try {
    await api.post('/subjects', { name: newSubjectName.value });
    newSubjectName.value = '';
    fetchSubjects();
  } catch (err) {
    alert('Failed to add subject. It might already exist.');
  }
};

const handleDeleteSubject = async (id: number) => {
  if (confirm('Are you sure? This might affect existing results.')) {
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      alert('Failed to delete subject.');
    }
  }
};

const filteredSubjects = () => {
  if (!searchQuery.value) return subjects.value;
  return subjects.value.filter(s => s.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 md:space-y-10">
    <div class="flex flex-col gap-6">
      <div class="relative w-full">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-900" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="SEARCH SUBJECTS..." 
          class="w-full pl-12 pr-6 py-4 bg-[darker-bg] border border-gold-900/30 rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-[10px] md:text-xs tracking-widest"
        />
      </div>
      
      <div class="flex flex-col sm:flex-row gap-4">
        <input 
          v-model="newSubjectName"
          type="text" 
          placeholder="NEW SUBJECT NAME..." 
          class="flex-1 px-6 py-4 bg-[darker-bg] border border-gold-900/30 rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-[10px] md:text-xs tracking-widest"
          @keyup.enter="handleAddSubject"
        />
        <button 
          @click="handleAddSubject"
          class="flex items-center justify-center px-8 py-4 bg-gold-500 text-black rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/10"
        >
          <Plus class="w-5 h-5 mr-2" />
          ADD SUBJECT
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div v-for="subject in filteredSubjects()" :key="subject.id" class="bg-[darker-bg] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gold-900/20 flex items-center justify-between group hover:border-gold-500/50 transition-all">
        <div class="flex items-center">
          <div class="p-2 md:p-3 bg-gold-900/20 rounded-xl mr-3 md:mr-4 group-hover:bg-gold-500/20 transition-colors">
            <BookOpen class="w-4 h-4 md:w-5 md:h-5 text-gold-500" />
          </div>
          <span class="font-black text-gold-100 uppercase tracking-widest text-[10px] md:text-xs">{{ subject.name }}</span>
        </div>
        <button @click="handleDeleteSubject(subject.id)" class="p-2 text-gold-900 hover:text-red-500 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100">
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-if="subjects.length === 0" class="text-center py-20 bg-[darker-bg] rounded-3xl border border-gold-900/20">
      <BookOpen class="w-12 h-12 text-gold-900 mx-auto mb-4" />
      <p class="text-gold-800 font-black uppercase tracking-widest">No subjects configured yet.</p>
    </div>
  </div>
</template>
