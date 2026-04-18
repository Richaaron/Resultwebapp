import { defineStore } from 'pinia';
import api from '../api';
import type { Student, Subject, Result, ResultSummary } from '../types';

export const useResultStore = defineStore('result', {
  state: () => ({
    students: [] as Student[],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    subjects: [] as Subject[],
    stats: null as any,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchStats() {
      try {
        const response = await api.get('/stats');
        this.stats = response.data;
      } catch (err: any) {
        this.error = err.message;
      }
    },
    async fetchStudents(params?: { search?: string; page?: number; limit?: number }) {
      this.loading = true;
      try {
        const response = await api.get('/students', { params });
        this.students = response.data.students;
        this.pagination = response.data.pagination;
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
        const res = await api.get(`/results/student/${studentId}/term/${term}/session/${session}`);
        const assessment = await api.get(`/reports/assessment/${studentId}/${term}/${session}`);
        return { ...res.data, assessment: assessment.data };
      } catch (err: any) {
        throw err;
      }
    },
    async getAssessment(studentId: number, term: string, session: string) {
      const res = await api.get(`/reports/assessment/${studentId}/${term}/${session}`);
      return res.data;
    },
    async upsertAssessment(data: any) {
      const res = await api.post('/reports/assessment', data);
      return res.data;
    },
    async getBroadsheet(params: any) {
      const response = await api.get('/reports/broadsheet', { params });
      return response.data;
    },
    async getCumulativeBroadsheet(params: any) {
      const response = await api.get('/reports/broadsheet/cumulative', { params });
      return response.data;
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
