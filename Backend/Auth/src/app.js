import express from 'express';
import auth from './routes/auth.route.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/', auth); 

export default app;