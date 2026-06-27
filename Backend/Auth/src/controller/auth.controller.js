import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
import BlacklistModel from '../models/blacklist.model.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { notifyLogin } from '../services/bullmq.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    const { credential, email, name, role } = req.body;
    if (!credential || !email) return res.status(400).json({ message: 'Missing Google credentials' });

    try {
        // Verify the access token with Google's userinfo endpoint
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${credential}` },
        });

        if (!googleRes.ok) {
            return res.status(401).json({ message: 'Invalid Google token' });
        }

        const googleData = await googleRes.json();

        // Make sure the email in the body matches what Google says
        if (googleData.email !== email) {
            return res.status(401).json({ message: 'Email mismatch' });
        }

        const requestedRole = role || 'customer';

        // Find existing user or create a new one
        let user = await userModel.findOne({ email, role: requestedRole });
        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            user = new userModel({
                username: name || googleData.name || email.split('@')[0],
                email,
                password: hashedPassword,
                role: requestedRole,
            });
            await user.save();
        }

        // Sign our own JWT — same as normal login
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        notifyLogin(user.username, user.email);
        return res.status(200).json({ message: 'Google login successful', token, email });
    } catch (error) {
        console.error('Google login error:', error);
        return res.status(500).json({ message: 'Google login failed', error: error.message });
    }
};

export const register = async (req, res) => {
    const { username, email, password, role } = req.body;
    console.log(req.body)
    const userexists = await userModel.findOne({ email, role }); 
    if (userexists) {
        return res.status(400).json({ message: 'User already exists' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ username, email, password: hashedPassword, role });
        await user.save();
        const token = jwt.sign({userId:user._id, role: user.role},process.env.JWT_SECRET,{expiresIn: "1d"});
        notifyLogin(user.username, user.email);
        res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
}

export const login = async (req, res) => {
    const { email, password, role } = req.body;
    console.log('LOGIN ATTEMPT:', { email, password, role });
    const user = await userModel.findOne({ email, role });
    if (!user) {
        console.log('LOGIN FAILED: User not found for email and role');
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log('LOGIN FAILED: Password mismatch');
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log('LOGIN SUCCESS:', user.email);
    const token = jwt.sign({userId:user._id, role: user.role},process.env.JWT_SECRET,{expiresIn: "1d"});
    notifyLogin(user.username, user.email);
    res.status(200).json({ message: 'Login successful', token, email });
}

export const logout = async (req, res) => {
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    await BlacklistModel.create({ token });
    res.status(200).json({ message: 'Logout successful' });
}

import Address from '../models/address.model.js';

export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user._id });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch addresses', error: error.message });
    }
};

export const addAddress = async (req, res) => {
    try {
        const { street, city, state, country, postalCode } = req.body;
        const newAddress = new Address({
            userId: req.user._id,
            street, city, state, country, postalCode
        });
        await newAddress.save();
        res.status(201).json(newAddress);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add address', error: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Address.findOneAndDelete({ _id: id, userId: req.user._id });
        if (!result) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json({ message: 'Address deleted successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete address', error: error.message });
    }
}; 