<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';
import { useResultStore } from '../store';
import { UserPlus, Trash2, ShieldCheck, Book, Users as UsersIcon } from 'lucide-vue-next';

const store = useResultStore();
const teachers = ref<any[]>([]);
const showModal = ref(false);
const showAssignModal = ref(false);
const selectedTeacher = ref<any>(null);
const newTeacherName = ref('');
const newTeacherImage = ref('');
const generatedCreds = ref<any>(null);

const assignment = ref({
  teacherId: null as number | null,
  class: '',
  subjectId: null as number | null,
  category: 'PRIMARY',
});

const fetchTeachers = async () => {
  const res = await api.get('/teachers');
  teachers.value = res.data;
};

onMounted(() => {
  fetchTeachers();
  store.fetchSubjects();
});

const handleCreateTeacher = async () => {
  try {
    const res = await api.post('/teachers', { 
      fullName: newTeacherName.value,
      image: newTeacherImage.value 
    });
    generatedCreds.value = res.data;
    newTeacherName.value = '';
    newTeacherImage.value = '';
    fetchTeachers();
  } catch (err) {
    alert('Failed to create teacher');
  }
};

const handleAssign = async () => {
  try {
    await api.post('/teachers/assign', {
      ...assignment.value,
      teacherId: selectedTeacher.value.id,
    });
    showAssignModal.value = false;
    fetchTeachers();
    assignment.value = { teacherId: null, class: '', subjectId: null, category: 'PRIMARY' };
  } catch (err) {
    alert('Failed to assign');
  }
};

const removeAssignment = async (id: number) => {
  if (confirm('Remove this assignment?')) {
    await api.delete(`/teachers/assign/${id}`);
    fetchTeachers();
  }
};

const deleteTeacher = async (id: number) => {
  if (confirm('Delete this teacher account? All assignments will be removed.')) {
    await api.delete(`/teachers/${id}`);
    fetchTeachers();
  }
};

const categories = ['PRE-NURSERY', 'NURSERY', 'PRIMARY', 'SECONDARY'];
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
      <h3 class="text-xl md:text-2xl font-black text-gold-500 uppercase tracking-widest">Teacher Management</h3>
      <button 
        @click="showModal = true; generatedCreds = null"
        class="w-full md:w-auto flex items-center justify-center px-8 py-4 bg-gold-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/10"
      >
        <UserPlus class="w-5 h-5 mr-2" />
        Register Staff
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      <div v-for="teacher in teachers" :key="teacher.id" class="bg-[#0d0a00] p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-gold-900/20 flex flex-col hover:border-gold-500/50 transition-all group relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4">
          <button @click="deleteTeacher(teacher.id)" class="text-gold-900 hover:text-red-500 transition-colors p-2">
            <Trash2 class="w-5 h-5" />
          </button>
        </div>

        <div class="flex flex-col items-center text-center mb-6 md:mb-8">
          <div class="w-16 h-16 md:w-20 md:h-20 bg-gold-900/20 text-gold-500 rounded-2xl md:rounded-3xl flex items-center justify-center font-black text-xl md:text-2xl mb-4 border border-gold-500/30 overflow-hidden shadow-inner group-hover:scale-110 transition-transform">
            <img v-if="teacher.image" :src="teacher.image" class="w-full h-full object-cover" />
            <span v-else>{{ teacher.fullName.charAt(0) }}</span>
          </div>
          <div>
            <h4 class="text-base md:text-lg font-black text-gold-100 uppercase tracking-widest truncate max-w-[200px]">{{ teacher.fullName }}</h4>
            <p class="text-[10px] text-gold-600 font-bold uppercase tracking-tighter">@{{ teacher.username }}</p>
          </div>
        </div>

        <div class="flex-1 space-y-3 md:space-y-4">
          <div class="text-[10px] font-black text-gold-800 uppercase tracking-[0.2em] border-b border-gold-900/20 pb-2">Assignments</div>
          <div v-if="teacher.assignments.length === 0" class="text-xs text-gold-900 font-bold uppercase italic py-2">No active assignments</div>
          <div v-for="assign in teacher.assignments" :key="assign.id" class="flex items-center justify-between bg-black/40 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gold-900/20 group/item">
            <div class="flex flex-col min-w-0">
              <span class="text-xs md:text-sm font-black text-gold-400 uppercase tracking-widest truncate">{{ assign.class || 'All Classes' }}</span>
              <span class="text-[8px] md:text-[10px] text-gold-600 font-bold uppercase truncate">{{ assign.subject?.name || 'All Subjects' }}</span>
            </div>
            <button @click="removeAssignment(assign.id)" class="p-2 bg-red-900/10 text-red-900 group-hover/item:text-red-500 rounded-lg transition-colors ml-2 shrink-0">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button 
          @click="selectedTeacher = teacher; showAssignModal = true"
          class="mt-6 md:mt-8 w-full py-4 border-2 border-dashed border-gold-900/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gold-700 hover:border-gold-500 hover:text-gold-500 hover:bg-gold-500/5 transition-all flex items-center justify-center"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Assignment
        </button>
      </div>
    </div>

    <!-- Add Teacher Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div class="bg-[#0d0a00] rounded-3xl shadow-2xl w-full max-w-[450px] p-6 md:p-10 border border-gold-500/30">
        <div v-if="!generatedCreds">
          <h3 class="text-xl md:text-2xl font-black text-gold-500 uppercase tracking-widest mb-6 md:mb-8">Register Teacher</h3>
          <div class="space-y-4 md:space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Full Name</label>
              <input v-model="newTeacherName" type="text" placeholder="e.g. John Doe" class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 outline-none focus:border-gold-500 transition-all text-sm" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Image URL (Optional)</label>
              <input v-model="newTeacherImage" type="text" placeholder="https://..." class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 outline-none focus:border-gold-500 transition-all text-xs" />
            </div>
            <div class="flex justify-end space-x-4 mt-8 md:mt-10">
              <button @click="showModal = false" class="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gold-700 hover:text-gold-500 transition-colors">Cancel</button>
              <button @click="handleCreateTeacher" class="px-6 py-3 bg-gold-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20">Create</button>
            </div>
          </div>
        </div>
        <div v-else class="text-center">
          <div class="w-16 h-16 md:w-20 md:h-20 bg-gold-500/20 text-gold-500 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold-500/30">
            <ShieldCheck class="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h3 class="text-xl md:text-2xl font-black text-gold-100 uppercase tracking-widest mb-2">Account Created!</h3>
          <p class="text-[10px] text-gold-700 font-bold uppercase mb-6 md:mb-8">Secure credentials generated</p>
          
          <div class="bg-black/40 p-4 md:p-6 rounded-2xl border border-gold-900/30 space-y-4 text-left mb-8 md:mb-10 shadow-inner">
            <div>
              <label class="text-[10px] font-black text-gold-800 uppercase tracking-widest">Username</label>
              <div class="font-mono font-black text-gold-100 text-lg md:text-xl tracking-tighter">{{ generatedCreds.teacher.username }}</div>
            </div>
            <div class="pt-4 border-t border-gold-900/10">
              <label class="text-[10px] font-black text-gold-800 uppercase tracking-widest">Password</label>
              <div class="font-mono font-black text-gold-500 text-lg md:text-xl tracking-tighter">{{ generatedCreds.generatedPassword }}</div>
            </div>
          </div>

          <button @click="showModal = false" class="w-full py-4 bg-gold-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20">CONFIRM & DONE</button>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div class="bg-[#0d0a00] rounded-3xl shadow-2xl w-full max-w-[450px] p-6 md:p-10 border border-gold-500/30">
        <h3 class="text-lg md:text-xl font-black text-gold-500 uppercase tracking-widest mb-6 md:mb-8">Assign Responsibilities</h3>
        <div class="space-y-4 md:space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Category</label>
            <select v-model="assignment.category" class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 text-sm outline-none focus:border-gold-500 transition-all">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Class (Optional)</label>
            <input v-model="assignment.class" type="text" placeholder="e.g. JSS 1" class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 text-sm outline-none focus:border-gold-500 transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Subject (Optional)</label>
            <select v-model="assignment.subjectId" class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 text-sm outline-none focus:border-gold-500 transition-all">
              <option :value="null">All Subjects</option>
              <option v-for="sub in store.subjects" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
            </select>
          </div>
          
          <div class="flex justify-end space-x-4 mt-8 md:mt-10">
            <button @click="showAssignModal = false" class="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gold-700 hover:text-gold-500 transition-colors">Cancel</button>
            <button @click="handleAssign" class="px-6 py-3 bg-gold-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20">Add Assignment</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
