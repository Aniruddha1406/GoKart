import express from 'express';
import productRoutes from './routes/products.route.js';
import cookieParser from 'cookie-parser';


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/', productRoutes);

export default app;