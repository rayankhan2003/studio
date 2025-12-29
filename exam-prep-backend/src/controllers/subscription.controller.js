
import User from '../models/User.js';
import Institution from '../models/Institution.js';

// This function would be triggered by a cron job daily in a real application.
export const checkExpirations = async (req, res, next) => {
    try {
        const today = new Date();

        // Find users whose subscriptions have expired and are still active
        const expiredUsers = await User.find({
            subscriptionStatus: 'active',
            subscriptionExpiresAt: { $ne: null, $lt: today },
        });

        // Find institutions whose subscriptions have expired
        const expiredInstitutions = await Institution.find({
            subscriptionStatus: 'active',
            subscriptionExpiresAt: { $ne: null, $lt: today },
        });

        // In a real app, you would send reminder emails here before expiration.
        // For example, find subscriptions expiring in 7 days and send a "renewal reminder".

        let usersUpdated = 0;
        for (const user of expiredUsers) {
            user.subscriptionStatus = 'expired';
            await user.save();
            usersUpdated++;
            // In a real app, send "subscription expired" email here.
        }

        let institutionsUpdated = 0;
        for (const institution of expiredInstitutions) {
            institution.subscriptionStatus = 'expired';
            await institution.save();
            institutionsUpdated++;
            // In a real app, send "subscription expired" email here.
        }
        
        res.json({ 
            message: "Expiration check completed.",
            expiredUsersFound: expiredUsers.length,
            expiredInstitutionsFound: expiredInstitutions.length,
            usersUpdated,
            institutionsUpdated,
        });

    } catch (e) {
        next(e);
    }
};
