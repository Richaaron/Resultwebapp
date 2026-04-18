<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useResultStore } from '../store';
import { Plus, Search, UserPlus } from 'lucide-vue-next';

const store = useResultStore();
const showModal = ref(false);
const searchQuery = ref('');

const newStudent = ref({
  regNo: '',
  firstName: '',
  lastName: '',
  category: 'PRIMARY' as any,
  class: '',
});

onMounted(() => {
  store.fetchStudents();
});

const handleAddStudent = async () => {
  try {
    await store.createStudent(newStudent.value);
    showModal.ref = false;
    newStudent.value = { regNo: '', firstName: '', lastName: '', category: 'PRIMARY', class: '' };
    alert('Student registered successfully!');
  } catch (err: any) {
    alert(err.response?.data?.error || 'Failed to register student');
  }
};

const categories = ['PRE-NURSERY', 'NURSERY', 'PRIMARY', 'SECONDARY'];
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div class="relative w-96">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search students by name or reg no..." 
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
        />
      </div>
      <button 
        @click="showModal = true"
        class="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <Plus class="w-4 h-4 mr-2" />
        Register Student
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50 text-gray-500 border-b">
          <tr>
            <th class="px-6 py-4 font-semibold">Reg No</th>
            <th class="px-6 py-4 font-semibold">Full Name</th>
            <th class="px-6 py-4 font-semibold">Category</th>
            <th class="px-6 py-4 font-semibold">Class</th>
            <th class="px-6 py-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="student in store.students" :key="student.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 font-medium text-gray-900">{{ student.regNo }}</td>
            <td class="px-6 py-4">{{ student.firstName }} {{ student.lastName }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                {{ student.category }}
              </span>
            </td>
            <td class="px-6 py-4">{{ student.class }}</td>
            <td class="px-6 py-4">
              <router-link 
                :to="{ name: 'ResultView', params: { id: student.id }}" 
                class="text-primary-600 hover:text-primary-800 font-medium"
              >
                View Result
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Register Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-[500px] p-8">
        <div class="flex items-center mb-6">
          <UserPlus class="w-6 h-6 text-primary-600 mr-2" />
          <h3 class="text-xl font-bold">Register New Student</h3>
        </div>
        
        <form @submit.prevent="handleAddStudent" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-medium text-gray-700">First Name</label>
              <input v-model="newStudent.firstName" type="text" required class="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-gray-700">Last Name</label>
              <input v-model="newStudent.lastName" type="text" required class="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-700">Registration Number</label>
            <input v-model="newStudent.regNo" type="text" required class="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-medium text-gray-700">Category</label>
              <select v-model="newStudent.category" class="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-gray-700">Class</label>
              <input v-model="newStudent.class" type="text" required placeholder="e.g. JSS 1" class="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-8">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Register</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
