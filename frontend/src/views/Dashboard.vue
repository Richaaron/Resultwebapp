<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useResultStore } from '../store';
import { useAuthStore } from '../store/auth';
import { useRoute } from 'vue-router';
import { Users, BookOpen, GraduationCap, TrendingUp, FileEdit, ShieldCheck } from 'lucide-vue-next';

const store = useResultStore();
const auth = useAuthStore();
const route = useRoute();

const schoolSlug = computed(() => route.params.schoolSlug as string);

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
  <div class="space-y-10 pb-20 relative">
    <!-- Decorative Background Element -->
    <div class="absolute -top-20 -right-20 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-40 -left-20 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-up">
      <div>
        <h2 class="text-2xl md:text-4xl font-black text-gold-500 uppercase tracking-tighter">Academic Overview</h2>
        <p class="text-gold-700 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mt-1">Live data from {{ auth.user?.school?.name }}</p>
      </div>
      <div class="flex items-center space-x-3 px-4 py-2 bg-gold-900/10 rounded-full border border-gold-900/20">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-[10px] font-black text-gold-500 uppercase tracking-widest">System Active</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
      <template v-if="store.loading && !store.stats">
        <div v-for="i in 4" :key="i" class="bg-[darker-bg] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gold-900/20 animate-pulse flex items-center space-x-4">
          <div class="w-12 h-12 md:w-16 md:h-16 bg-gold-900/20 rounded-xl md:rounded-2xl"></div>
          <div class="space-y-2 flex-1">
            <div class="h-2 w-16 bg-gold-900/20 rounded"></div>
            <div class="h-6 w-12 bg-gold-900/20 rounded"></div>
          </div>
        </div>
      </template>
      <div v-else v-for="(stat, index) in stats" :key="stat.name" 
           class="bg-[darker-bg] p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-gold-900/20 flex items-center space-x-4 md:space-x-6 hover:border-gold-500/50 transition-all group animate-fade-scale"
           :class="'stagger-' + (index + 1)">
        <div :class="[stat.color, 'w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500']">
          <component :is="stat.icon" class="w-6 h-6 md:w-8 md:h-8 text-black" />
        </div>
        <div>
          <p class="text-[10px] md:text-xs font-black text-gold-700 uppercase tracking-widest">{{ stat.name }}</p>
          <p class="text-2xl md:text-3xl font-black text-gold-100 mt-1">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
      <!-- Recent Students -->
      <div class="lg:col-span-2 bg-[darker-bg] p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-gold-900/20 animate-fade-up stagger-3">
        <div class="flex items-center justify-between mb-8 md:mb-10">
          <h3 class="text-lg md:text-xl font-black text-gold-500 uppercase tracking-widest">{{ auth.isAdmin ? 'Recent Students' : 'My Students' }}</h3>
          <router-link :to="`/${schoolSlug}/students`" class="text-[10px] font-black text-gold-700 hover:text-gold-500 uppercase tracking-widest transition-colors">View All</router-link>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr class="text-[10px] font-black text-gold-800 uppercase tracking-[0.2em]">
                <th class="px-6 md:px-0 pb-4">Profile</th>
                <th class="pb-4">Name</th>
                <th class="pb-4">Class</th>
                <th class="pb-4 hidden sm:table-cell">Category</th>
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
                <td class="px-6 md:px-0 py-4">
                  <div class="w-10 h-10 rounded-full bg-gold-900/20 border border-gold-900/30 overflow-hidden shadow-inner group-hover:border-gold-500/50 transition-colors">
                    <img v-if="student.image" :src="student.image" class="w-full h-full object-cover" />
                    <Users class="w-5 h-5 m-2.5 text-gold-800" v-else />
                  </div>
                </td>
                <td class="py-4 font-bold text-sm text-gold-100 group-hover:text-gold-500 transition-colors">{{ student.firstName }} {{ student.lastName }}</td>
                <td class="py-4 text-gold-400 font-medium text-xs">{{ student.class }}</td>
                <td class="py-4 hidden sm:table-cell">
                  <span class="px-3 py-1 text-[8px] font-black tracking-widest rounded-full bg-gold-900/20 text-gold-500 border border-gold-500/20 uppercase">
                    {{ student.category }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-[darker-bg] p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-gold-900/20 animate-fade-up stagger-4">
        <div class="relative overflow-hidden">
          <h3 class="text-lg md:text-xl font-black text-gold-500 uppercase tracking-widest mb-6 md:mb-8">Quick Actions</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <router-link v-if="auth.isAdmin" :to="`/${schoolSlug}/students`" class="p-4 md:p-6 bg-gold-900/10 border border-gold-900/30 rounded-xl md:rounded-2xl hover:bg-gold-500 hover:text-black transition-all group flex items-center hover:scale-105 duration-300">
              <div class="p-2 md:p-3 bg-gold-500/20 rounded-lg md:rounded-xl mr-4 group-hover:bg-black/10 transition-colors shrink-0">
                <Users class="w-5 h-5 md:w-6 md:h-6 text-gold-500 group-hover:text-black" />
              </div>
              <span class="text-[10px] md:text-sm font-black uppercase tracking-widest">Register Student</span>
            </router-link>
            
            <router-link :to="`/${schoolSlug}/score-entry`" class="p-4 md:p-6 bg-gold-900/10 border border-gold-900/30 rounded-xl md:rounded-2xl hover:bg-gold-500 hover:text-black transition-all group flex items-center hover:scale-105 duration-300">
              <div class="p-2 md:p-3 bg-gold-500/20 rounded-lg md:rounded-xl mr-4 group-hover:bg-black/10 transition-colors shrink-0">
                <FileEdit class="w-5 h-5 md:w-6 md:h-6 text-gold-500 group-hover:text-black" />
              </div>
              <span class="text-[10px] md:text-sm font-black uppercase tracking-widest">Enter Scores</span>
            </router-link>

            <router-link v-if="auth.isAdmin" :to="`/${schoolSlug}/teachers`" class="p-4 md:p-6 bg-gold-900/10 border border-gold-900/30 rounded-xl md:rounded-2xl hover:bg-gold-500 hover:text-black transition-all group flex items-center hover:scale-105 duration-300">
              <div class="p-2 md:p-3 bg-gold-500/20 rounded-lg md:rounded-xl mr-4 group-hover:bg-black/10 transition-colors shrink-0">
                <ShieldCheck class="w-5 h-5 md:w-6 md:h-6 text-gold-500 group-hover:text-black" />
              </div>
              <span class="text-[10px] md:text-sm font-black uppercase tracking-widest">Manage Teachers</span>
            </router-link>
          </div>
          
          <!-- Decorative SVG Illustration -->
          <div class="mt-12 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C86.9,14.5,81.2,29,72.4,41.4C63.6,53.8,51.8,64.1,38.2,71.5C24.5,78.8,9,83.1,-5.9,83.4C-20.8,83.7,-35.1,80,-48.2,72.4C-61.3,64.8,-73.2,53.3,-80.4,39.6C-87.6,25.9,-90.1,10,-88.1,-5.2C-86.1,-20.3,-79.6,-34.7,-69.7,-46.3C-59.8,-57.9,-46.5,-66.6,-33.1,-74.2C-19.7,-81.8,-6.2,-88.3,8.4,-89.7C23.1,-91.1,30.6,-83.5,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
