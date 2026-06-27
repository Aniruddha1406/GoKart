import app from './src/app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: "./.env" });

connectDB();

app.listen(3001, () => {
    console.log('Auth service is running on port http://localhost:3001');
}) 