import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import studentRoutes from './routes/student.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import resultRoutes from './routes/result.routes.js';
import authRoutes from './routes/auth.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import reportRoutes from './routes/report.routes.js';
import statsRoutes from './routes/stats.routes.js';
import schoolRoutes from './routes/school.routes.js';
import { errorHandler } from './utils/error.middleware.js';
import { schoolMiddleware } from './utils/auth.middleware.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(schoolMiddleware);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.headers['x-school-slug']) {
    console.log(`School Slug: ${req.headers['x-school-slug']}`);
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/results', resultRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Result management system API' });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
