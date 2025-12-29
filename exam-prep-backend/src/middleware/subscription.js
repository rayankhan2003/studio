
import User from '../models/User.js';
import Institution from '../models/Institution.js';

export const requireSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Admins have universal access
        if (user.role === 'admin') {
            return next();
        }
        
        let subscriptionStatus, expiresAt;

        if (user.institution) {
            // This is an institutional user (admin, teacher, student)
            const institution = await Institution.findById(user.institution);
            if (!institution) {
                return res.status(403).json({ message: "You are not associated with a valid institution." });
            }
            subscriptionStatus = institution.subscriptionStatus;
            expiresAt = institution.subscriptionExpiresAt;
        } else {
            // This is an individual student
            subscriptionStatus = user.subscriptionStatus;
            expiresAt = user.subscriptionExpiresAt;
        }

        if (subscriptionStatus !== 'active') {
            return res.status(403).json({ message: "Your subscription is not active. Please subscribe or renew." });
        }

        if (expiresAt && new Date() > expiresAt) {
             return res.status(403).json({ message: "Your subscription has expired. Please renew." });
        }
        
        next();
    } catch (e) {
        next(e);
    }
};
