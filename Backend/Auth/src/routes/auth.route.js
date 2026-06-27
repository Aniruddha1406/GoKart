import express from 'express';
import { register, login, logout, googleLogin } from '../controller/auth.controller.js';

const router = express.Router();

router.post('/register', register);
//notify for registration success or failure
router.post('/login', login);
//notify for login success or failure
router.post('/google', googleLogin);
router.get('/logout', logout); 

import { getAddresses, addAddress, deleteAddress } from '../controller/auth.controller.js';
import { customer_authenticate } from '../middleware/customer.auth.middleware.js';

router.get('/addresses', customer_authenticate, getAddresses);
router.post('/addresses', customer_authenticate, addAddress);
router.delete('/addresses/:id', customer_authenticate, deleteAddress);

export default router;