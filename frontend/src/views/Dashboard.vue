<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useResultStore } from '../store';
import { useAuthStore } from '../store/auth';
import { Users, BookOpen, GraduationCap, TrendingUp, FileEdit } from 'lucide-vue-next';

const store = useResultStore();
const auth = useAuthStore();

onMounted(() => {
  store.fetchStudents();
  store.fetchSubjects();
  store.fetchStats();
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

const stats = computed(() => [
  { 
    name: auth.isAdmin ? 'Total Students' : 'Assigned Students', 
    value: auth.isAdmin ? (store.stats?.summary?.students || 0) : filteredStudents.value.length, 
    icon: Users, 
    color: 'bg-blue-500' 
  },
  { 
    name: 'Total Subjects', 
    value: store.stats?.summary?.subjects || store.subjects.length, 
    icon: BookOpen, 
    color: 'bg-purple-500' 
  },
  { 
    name: 'Total Teachers', 
    value: store.stats?.summary?.teachers || 0, 
    icon: GraduationCap, 
    color: 'bg-green-500' 
  },
  { 
    name: 'Total Results', 
    value: store.stats?.summary?.results || 0, 
    icon: TrendingUp, 
    color: 'bg-orange-500' 
  },
]);
</script>

<template>
  <div class="space-y-6 md:space-y-10">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
      <template v-if="store.loading && !store.stats">
        <div v-for="i in 4" :key="i" class="bg-[#0d0a00] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gold-900/20 animate-pulse flex items-center space-x-4">
          <div class="w-12 h-12 md:w-16 md:h-16 bg-gold-900/20 rounded-xl md:rounded-2xl"></div>
          <div class="space-y-2 flex-1">
            <div class="h-2 w-16 bg-gold-900/20 rounded"></div>
            <div class="h-6 w-12 bg-gold-900/20 rounded"></div>
          </div>
        </div>
      </template>
      <div v-else v-for="stat in stats" :key="stat.name" class="bg-[#0d0a00] p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-gold-900/20 flex items-center space-x-4 md:space-x-6 hover:border-gold-500/50 transition-all group">
        <div :class="[stat.color, 'p-3 md:p-4 rounded-xl md:rounded-2xl text-black shadow-lg group-hover:scale-110 transition-transform shrink-0']">
          <component :is="stat.icon" class="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-gold-700 uppercase tracking-widest mb-0.5 md:mb-1 truncate">{{ stat.name }}</p>
          <p class="text-2xl md:text-3xl font-black text-gold-100">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
      <!-- Recent Students -->
      <div class="lg:col-span-2 bg-[#0d0a00] p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-gold-900/20">
        <h3 class="text-lg md:text-xl font-black text-gold-500 uppercase tracking-widest mb-6 md:mb-8 flex items-center">
          <Users class="w-5 h-5 md:w-6 md:h-6 mr-3" />
          {{ auth.isAdmin ? 'Recent Students' : 'My Students' }}
        </h3>
        <div class="overflow-x-auto -mx-6 md:mx-0">
          <table class="w-full text-left min-w-[500px] md:min-w-0">
            <thead class="text-gold-700 border-b border-gold-900/30">
              <tr class="text-[10px] font-black uppercase tracking-widest">
                <th class="px-6 md:px-0 pb-5">Photo</th>
                <th class="pb-5">Name</th>
                <th class="pb-5">Class</th>
                <th class="pb-5 hidden sm:table-cell">Category</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gold-900/10">
              <template v-if="store.loading && store.students.length === 0">
                <tr v-for="i in 5" :key="i" class="animate-pulse">
                  <td class="px-6 md:px-0 py-4"><div class="w-10 h-10 rounded-full bg-gold-900/20"></div></td>
                  <td class="py-4"><div class="h-4 w-32 bg-gold-900/20 rounded"></div></td>
                  <td class="py-4"><div class="h-4 w-16 bg-gold-900/20 rounded"></div></td>
                  <td class="py-4 hidden sm:table-cell"><div class="h-4 w-16 bg-gold-900/20 rounded"></div></td>
                </tr>
              </template>
              <tr v-else v-for="student in filteredStudents.slice(0, 5)" :key="student.id" class="hover:bg-gold-900/5 transition-colors group">
                <td class="px-6 md:px-0 py-4 md:py-5">
                  <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold-900/20 border border-gold-900/30 overflow-hidden shadow-inner shrink-0">
                    <img v-if="student.image" :src="student.image" class="w-full h-full object-cover" />
                    <Users class="w-5 h-5 md:w-6 md:h-6 m-2.5 md:m-3 text-gold-800" v-else />
                  </div>
                </td>
                <td class="py-4 md:py-5 font-bold text-gold-100 text-sm md:text-base">{{ student.firstName }} {{ student.lastName }}</td>
                <td class="py-4 md:py-5 text-gold-400 font-medium text-xs md:text-sm">{{ student.class }}</td>
                <td class="py-4 md:py-5 hidden sm:table-cell">
                  <span class="px-2 md:px-3 py-1 text-[8px] md:text-[10px] font-black tracking-widest rounded-full bg-gold-900/20 text-gold-500 border border-gold-500/20 uppercase">
                    {{ student.category }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-6 md:space-y-10">
        <div class="bg-[#0d0a00] p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-gold-900/20">
          <h3 class="text-lg md:text-xl font-black text-gold-500 uppercase tracking-widest mb-6 md:mb-8">Quick Actions</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <router-link v-if="auth.isAdmin" to="/students" class="p-4 md:p-6 bg-gold-900/10 border border-gold-900/30 rounded-xl md:rounded-2xl hover:bg-gold-500 hover:text-black transition-all group flex items-center">
              <div class="p-2 md:p-3 bg-gold-500/20 rounded-lg md:rounded-xl mr-4 group-hover:bg-black/10 transition-colors shrink-0">
                <Users class="w-5 h-5 md:w-6 md:h-6 text-gold-500 group-hover:text-black" />
              </div>
              <span class="text-[10px] md:text-sm font-black uppercase tracking-widest">Register Student</span>
            </router-link>
            
            <router-link to="/score-entry" class="p-4 md:p-6 bg-gold-900/10 border border-gold-900/30 rounded-xl md:rounded-2xl hover:bg-gold-500 hover:text-black transition-all group flex items-center">
              <div class="p-2 md:p-3 bg-gold-500/20 rounded-lg md:rounded-xl mr-4 group-hover:bg-black/10 transition-colors shrink-0">
                <FileEdit class="w-5 h-5 md:w-6 md:h-6 text-gold-500 group-hover:text-black" />
              </div>
              <span class="text-[10px] md:text-sm font-black uppercase tracking-widest">Enter Scores</span>
            </router-link>

            <router-link v-if="auth.isAdmin" to="/teachers" class="p-4 md:p-6 bg-gold-900/10 border border-gold-900/30 rounded-xl md:rounded-2xl hover:bg-gold-500 hover:text-black transition-all group flex items-center">
              <div class="p-2 md:p-3 bg-gold-500/20 rounded-lg md:rounded-xl mr-4 group-hover:bg-black/10 transition-colors shrink-0">
                <ShieldCheck class="w-5 h-5 md:w-6 md:h-6 text-gold-500 group-hover:text-black" />
              </div>
              <span class="text-[10px] md:text-sm font-black uppercase tracking-widest">Manage Teachers</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
