import jwt from 'jsonwebtoken';
import blacklistModel from '../models/blacklist.model.js';

export const seller_authenticate = async (req, res, next) => {
    const token = req.headers?.authorization?.split(' ')[1] || req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        if(await blacklistModel.exists({token})){
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'seller') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        // Build req.user from the verified JWT payload — no DB lookup needed
        req.user = { _id: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}