<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useResultStore } from '../store';
import { useAuthStore } from '../store/auth';
import { Plus, Search, UserPlus, Users, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const store = useResultStore();
const auth = useAuthStore();
const showModal = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);

const newStudent = ref({
  regNo: '',
  firstName: '',
  lastName: '',
  category: 'PRIMARY' as any,
  class: '',
  image: '',
});

const fetchStudents = () => {
  store.fetchStudents({
    search: searchQuery.value,
    page: currentPage.value,
    limit: 10
  });
};

onMounted(() => {
  fetchStudents();
});

// Debounce search
let searchTimeout: any;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchStudents();
  }, 500);
});

const changePage = (page: number) => {
  if (page < 1 || page > store.pagination.totalPages) return;
  currentPage.value = page;
  fetchStudents();
};

const handleAddStudent = async () => {
  try {
    await store.createStudent(newStudent.value);
    showModal.value = false;
    newStudent.value = { regNo: '', firstName: '', lastName: '', category: 'PRIMARY', class: '', image: '' };
    alert('Student registered successfully!');
  } catch (err: any) {
    alert(err.response?.data?.error || 'Failed to register student');
  }
};

const categories = ['PRE-NURSERY', 'NURSERY', 'PRIMARY', 'SECONDARY'];
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div class="relative w-full md:w-96">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-900" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="SEARCH STUDENTS..." 
          class="w-full pl-12 pr-6 py-4 bg-[#0d0a00] border border-gold-900/30 rounded-2xl text-gold-100 font-bold outline-none focus:border-gold-500 transition-all text-xs tracking-widest"
        />
      </div>
      <button 
        v-if="auth.isAdmin"
        @click="showModal = true"
        class="w-full md:w-auto flex items-center justify-center px-8 py-4 bg-gold-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/10"
      >
        <Plus class="w-5 h-5 mr-2" />
        Register
      </button>
    </div>

    <div class="bg-[#0d0a00] rounded-2xl md:rounded-3xl shadow-2xl border border-gold-900/20 overflow-hidden">
      <div class="overflow-x-auto -mx-0">
        <table class="w-full text-left min-w-[700px] md:min-w-0">
          <thead class="bg-gold-900/10 text-gold-700 border-b border-gold-900/30">
            <tr class="text-[10px] font-black uppercase tracking-widest">
              <th class="px-6 md:px-8 py-5">Photo</th>
              <th class="px-6 md:px-8 py-5">Reg No</th>
              <th class="px-6 md:px-8 py-5">Full Name</th>
              <th class="px-6 md:px-8 py-5 hidden sm:table-cell">Category</th>
              <th class="px-6 md:px-8 py-5">Class</th>
              <th class="px-6 md:px-8 py-5 text-right text-gold-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gold-900/10 text-gold-100">
            <tr v-if="store.loading" v-for="i in 5" :key="i" class="animate-pulse">
              <td class="px-6 md:px-8 py-4 md:py-5"><div class="w-10 h-10 rounded-full bg-gold-900/20"></div></td>
              <td class="px-6 md:px-8 py-4 md:py-5"><div class="h-4 w-20 bg-gold-900/20 rounded"></div></td>
              <td class="px-6 md:px-8 py-4 md:py-5"><div class="h-4 w-32 bg-gold-900/20 rounded"></div></td>
              <td class="px-6 md:px-8 py-4 md:py-5 hidden sm:table-cell"><div class="h-4 w-16 bg-gold-900/20 rounded"></div></td>
              <td class="px-6 md:px-8 py-4 md:py-5"><div class="h-4 w-16 bg-gold-900/20 rounded"></div></td>
              <td class="px-6 md:px-8 py-4 md:py-5 text-right"><div class="h-8 w-16 bg-gold-900/20 rounded ml-auto"></div></td>
            </tr>
            <tr v-else v-for="student in store.students" :key="student.id" class="hover:bg-gold-900/5 transition-colors group">
              <td class="px-6 md:px-8 py-4 md:py-5">
                <div class="w-10 h-10 rounded-full bg-gold-900/20 border border-gold-900/30 overflow-hidden shadow-inner shrink-0">
                  <img v-if="student.image" :src="student.image" class="w-full h-full object-cover" />
                  <Users class="w-5 h-5 m-2.5 text-gold-800" v-else />
                </div>
              </td>
              <td class="px-6 md:px-8 py-4 md:py-5 font-black text-gold-500 text-xs">{{ student.regNo }}</td>
              <td class="px-6 md:px-8 py-4 md:py-5 font-bold text-sm">{{ student.firstName }} {{ student.lastName }}</td>
              <td class="px-6 md:px-8 py-4 md:py-5 hidden sm:table-cell">
                <span class="px-3 py-1 text-[8px] md:text-[10px] font-black tracking-widest rounded-full bg-gold-900/20 text-gold-400 border border-gold-500/20 uppercase">
                  {{ student.category }}
                </span>
              </td>
              <td class="px-6 md:px-8 py-4 md:py-5 text-gold-400 font-medium text-xs">{{ student.class }}</td>
              <td class="px-6 md:px-8 py-4 md:py-5 text-right">
                <router-link 
                  :to="{ name: 'ResultView', params: { id: student.id }}" 
                  class="inline-block px-4 py-2 bg-gold-500/10 text-gold-500 hover:bg-gold-500 hover:text-black rounded-lg font-black text-[10px] uppercase tracking-widest transition-all border border-gold-500/20"
                >
                  View
                </router-link>
              </td>
            </tr>
            <tr v-if="!store.loading && store.students.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-gold-700 font-black uppercase tracking-widest text-xs">
                No students found matching your search.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="store.pagination.totalPages > 1" class="flex items-center justify-between bg-[#0d0a00] p-4 rounded-2xl border border-gold-900/20">
      <div class="text-[10px] font-black text-gold-700 uppercase tracking-widest">
        Showing {{ (store.pagination.page - 1) * store.pagination.limit + 1 }} to {{ Math.min(store.pagination.page * store.pagination.limit, store.pagination.total) }} of {{ store.pagination.total }} students
      </div>
      <div class="flex items-center space-x-2">
        <button 
          @click="changePage(store.pagination.page - 1)"
          :disabled="store.pagination.page === 1"
          class="p-2 bg-gold-900/10 text-gold-500 rounded-lg border border-gold-900/30 disabled:opacity-30 transition-all"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div class="flex items-center space-x-1">
          <button 
            v-for="p in store.pagination.totalPages" 
            :key="p"
            @click="changePage(p)"
            :class="[
              'w-8 h-8 rounded-lg font-black text-[10px] transition-all',
              store.pagination.page === p ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'bg-gold-900/10 text-gold-700 border border-gold-900/30 hover:border-gold-500'
            ]"
          >
            {{ p }}
          </button>
        </div>
        <button 
          @click="changePage(store.pagination.page + 1)"
          :disabled="store.pagination.page === store.pagination.totalPages"
          class="p-2 bg-gold-900/10 text-gold-500 rounded-lg border border-gold-900/30 disabled:opacity-30 transition-all"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Register Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div class="bg-[#0d0a00] rounded-3xl shadow-2xl w-full max-w-[550px] p-6 md:p-10 border border-gold-500/30 overflow-y-auto max-h-[90vh]">
        <div class="flex items-center mb-6 md:mb-8">
          <div class="p-3 bg-gold-500 rounded-xl md:rounded-2xl mr-4 shadow-lg shadow-gold-500/20">
            <UserPlus class="w-6 h-6 md:w-8 md:h-8 text-black" />
          </div>
          <h3 class="text-lg md:text-2xl font-black text-gold-500 uppercase tracking-widest">Register Student</h3>
        </div>
        
        <form @submit.prevent="handleAddStudent" class="space-y-4 md:space-y-6">
          <div class="flex flex-col items-center mb-4 md:mb-6">
            <div class="relative group">
              <div class="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gold-900/20 border-2 border-dashed border-gold-500/30 flex items-center justify-center overflow-hidden group-hover:border-gold-500 transition-all">
                <img v-if="newStudent.image" :src="newStudent.image" class="w-full h-full object-cover" />
                <Plus class="w-6 h-6 md:w-8 md:h-8 text-gold-800" v-else />
              </div>
              <input 
                type="text" 
                v-model="newStudent.image" 
                placeholder="IMAGE URL" 
                class="mt-3 w-full px-4 py-2 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 text-[10px] outline-none focus:border-gold-500 transition-all text-center"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">First Name</label>
              <input v-model="newStudent.firstName" type="text" required class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 text-sm outline-none focus:border-gold-500 transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Last Name</label>
              <input v-model="newStudent.lastName" type="text" required class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 text-sm outline-none focus:border-gold-500 transition-all" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Admission Number</label>
            <input v-model="newStudent.regNo" type="text" required class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 text-sm outline-none focus:border-gold-500 transition-all" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Category</label>
              <select v-model="newStudent.category" class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 text-sm outline-none focus:border-gold-500 transition-all">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gold-700 uppercase tracking-widest ml-1">Class</label>
              <input v-model="newStudent.class" type="text" required placeholder="e.g. JSS 1" class="w-full px-4 py-3 bg-black/40 border border-gold-900/30 rounded-xl text-gold-100 text-sm outline-none focus:border-gold-500 transition-all" />
            </div>
          </div>

          <div class="flex justify-end space-x-4 mt-8">
            <button type="button" @click="showModal = false" class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gold-700 hover:text-gold-500 transition-colors">Cancel</button>
            <button type="submit" class="px-8 py-3 bg-gold-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20">Complete Registration</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
