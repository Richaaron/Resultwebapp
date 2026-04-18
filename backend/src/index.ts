import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import studentRoutes from './routes/student.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import resultRoutes from './routes/result.routes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/results', resultRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Folusho Victory Schools Result Management API' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
