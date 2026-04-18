import { defineStore } from 'pinia';
import api from '../api';
import type { Student, Subject, Result, ResultSummary } from '../types';

export const useResultStore = defineStore('result', {
  state: () => ({
    students: [] as Student[],
    subjects: [] as Subject[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchStudents() {
      this.loading = true;
      try {
        const response = await api.get('/students');
        this.students = response.data;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async fetchSubjects() {
      try {
        const response = await api.get('/subjects');
        this.subjects = response.data;
      } catch (err: any) {
        this.error = err.message;
      }
    },
    async createStudent(studentData: Partial<Student>) {
      try {
        const response = await api.post('/students', studentData);
        this.students.push(response.data);
        return response.data;
      } catch (err: any) {
        throw err;
      }
    },
    async upsertResult(resultData: Partial<Result>) {
      try {
        const response = await api.post('/results', resultData);
        return response.data;
      } catch (err: any) {
        throw err;
      }
    },
    async getStudentResult(studentId: number, term: string, session: string): Promise<ResultSummary> {
      try {
        const response = await api.get(`/results/student/${studentId}/term/${term}/session/${session}`);
        return response.data;
      } catch (err: any) {
        throw err;
      }
    },
    async getStudentById(id: number): Promise<Student> {
      try {
        const response = await api.get(`/students/${id}`);
        return response.data;
      } catch (err: any) {
        throw err;
      }
    }
  },
});
