import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const getBroadsheet = async (req: any, res: Response) => {
  const { class: className, term, session } = req.query;
  try {
    // Get all students in the class
    const students = await prisma.student.findMany({
      where: { class: className as string },
      include: {
        results: {
          where: { term: term as string, session: session as string },
          include: { subject: true }
        }
      }
    });

    // Get all subjects that have results in this class/term/session
    const subjectIds = new Set<number>();
    students.forEach(s => s.results.forEach(r => subjectIds.add(r.subjectId)));
    
    const subjects = await prisma.subject.findMany({
      where: { id: { in: Array.from(subjectIds) } }
    });

    // Format data for a grid
    const broadsheet = students.map(student => {
      const studentResults: any = {};
      student.results.forEach(r => {
        studentResults[r.subjectId] = {
          total: r.total,
          grade: r.grade
        };
      });

      const totalScore = student.results.reduce((sum, r) => sum + r.total, 0);
      const average = student.results.length > 0 ? totalScore / student.results.length : 0;

      return {
        id: student.id,
        regNo: student.regNo,
        fullName: `${student.firstName} ${student.lastName}`,
        results: studentResults,
        totalScore,
        average
      };
    }).sort((a, b) => b.totalScore - a.totalScore); // Sort by total score (ranking)

    res.json({ broadsheet, subjects });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const exportBroadsheet = async (req: any, res: Response) => {
  const { class: className, term, session } = req.query;
  try {
    const students = await prisma.student.findMany({
      where: { class: className as string },
      include: {
        results: {
          where: { term: term as string, session: session as string },
          include: { subject: true }
        }
      }
    });

    const subjectIds = new Set<number>();
    students.forEach(s => s.results.forEach(r => subjectIds.add(r.subjectId)));
    
    const subjects = await prisma.subject.findMany({
      where: { id: { in: Array.from(subjectIds) } }
    });

    // CSV Headers
    let csv = 'Reg No,Full Name,' + subjects.map(s => s.name).join(',') + ',Total,Average,Rank\n';

    // CSV Rows
    const rows = students.map(student => {
      const studentResults: any = {};
      student.results.forEach(r => {
        studentResults[r.subjectId] = r.total;
      });

      const totalScore = student.results.reduce((sum, r) => sum + r.total, 0);
      const average = (student.results.length > 0 ? totalScore / student.results.length : 0).toFixed(2);

      return {
        regNo: student.regNo,
        fullName: `${student.firstName} ${student.lastName}`,
        results: studentResults,
        totalScore,
        average
      };
    }).sort((a, b) => b.totalScore - a.totalScore);

    rows.forEach((row, index) => {
      const subjectScores = subjects.map(s => row.results[s.id] || '-').join(',');
      csv += `${row.regNo},${row.fullName},${subjectScores},${row.totalScore},${row.average},${index + 1}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=broadsheet_${className}_${term}_${session}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};
