<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useResultStore } from '../store';
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-vue-next';

const store = useResultStore();

onMounted(() => {
  store.fetchStudents();
  store.fetchSubjects();
});

const stats = computed(() => [
  { name: 'Total Students', value: store.students.length, icon: Users, color: 'bg-blue-500' },
  { name: 'Total Subjects', value: store.subjects.length, icon: BookOpen, color: 'bg-purple-500' },
  { name: 'Active Classes', value: 12, icon: GraduationCap, color: 'bg-green-500' },
  { name: 'Performance Rate', value: '84%', icon: TrendingUp, color: 'bg-orange-500' },
]);
</script>

<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.name" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div :class="[stat.color, 'p-3 rounded-lg text-white']">
          <component :is="stat.icon" class="w-6 h-6" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">{{ stat.name }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold mb-4">Recent Students</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="text-gray-500 border-b">
              <tr>
                <th class="pb-3 font-semibold">Name</th>
                <th class="pb-3 font-semibold">Class</th>
                <th class="pb-3 font-semibold">Category</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="student in store.students.slice(0, 5)" :key="student.id" class="hover:bg-gray-50 transition-colors">
                <td class="py-3 font-medium">{{ student.firstName }} {{ student.lastName }}</td>
                <td class="py-3 text-gray-600">{{ student.class }}</td>
                <td class="py-3">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                    {{ student.category }}
                  </span>
                </td>
              </tr>
              <tr v-if="store.students.length === 0">
                <td colspan="3" class="py-8 text-center text-gray-400">No students found. Register some to get started.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 gap-4">
          <router-link to="/students" class="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
            <Users class="w-6 h-6 mx-auto mb-2 text-primary-600" />
            <span class="text-sm font-medium">Add Student</span>
          </router-link>
          <router-link to="/score-entry" class="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
            <FileEdit class="w-6 h-6 mx-auto mb-2 text-primary-600" />
            <span class="text-sm font-medium">Enter Scores</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
