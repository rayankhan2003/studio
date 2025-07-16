
'use client';

// A simple client-side logger that stores logs in localStorage.
// In a real app, this would be an API call to a secure backend.

interface ActivityLog {
    id: string;
    timestamp: string;
    adminName: string;
    adminRole: string; // 'Super Admin' or the sub-admin's role
    action: string;
}

export function logActivity(action: string) {
    try {
        const storedUserRaw = localStorage.getItem('path2med-user');
        if (!storedUserRaw) {
            console.warn("Could not log activity: No user found in storage.");
            return;
        }
        const user = JSON.parse(storedUserRaw);

        const storedAdminsRaw = localStorage.getItem('path2med-sub-admins');
        const subAdmins = storedAdminsRaw ? JSON.parse(storedAdminsRaw) : [];
        const subAdminInfo = user.isSuperAdmin ? null : subAdmins.find((sa: any) => sa.email === user.email);

        const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            adminName: user.name,
            adminRole: user.isSuperAdmin ? 'Super Admin' : (subAdminInfo?.role || 'Sub-Admin'),
            action: action,
        };

        const existingLogsRaw = localStorage.getItem('path2med-activity-logs');
        const existingLogs: ActivityLog[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
        
        // Add new log to the beginning of the array and limit to 100 entries
        const updatedLogs = [newLog, ...existingLogs].slice(0, 100);

        localStorage.setItem('path2med-activity-logs', JSON.stringify(updatedLogs));

    } catch (error) {
        console.error("Failed to write to activity log:", error);
    }
}
