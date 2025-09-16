
import User from '../models/User.js';
import Institution from '../models/Institution.js';
import { ROLES } from '../utils/roles.js';

// For institution admin to add a new teacher
export const addTeacher = async (req, res, next) => {
    try {
        const { name, email, password, subjects } = req.body;
        const institutionAdmin = await User.findById(req.user.id);
        const institutionId = institutionAdmin.institution;

        if (!institutionId) {
            return res.status(400).json({ message: "Admin is not associated with any institution." });
        }

        // Check if email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "This email is already registered." });
        }

        const teacher = await User.create({
            name,
            email,
            password,
            role: ROLES.TEACHER,
            institutionalRole: ROLES.TEACHER,
            institution: institutionId,
            // In a real app, subjects might be stored differently
            // For now, this is a placeholder if you pass subjects in the body.
        });

        // Add teacher to the institution's list of teachers
        await Institution.findByIdAndUpdate(institutionId, {
            $addToSet: { teachers: teacher._id }
        });

        res.status(201).json({ message: "Teacher created and added to institution successfully.", teacher });
    } catch (e) {
        next(e);
    }
};

// For institution admin to list all teachers in their institution
export const listTeachers = async (req, res, next) => {
    try {
        const institutionAdmin = await User.findById(req.user.id);
        const institutionId = institutionAdmin.institution;

        const teachers = await User.find({
            institution: institutionId,
            institutionalRole: ROLES.TEACHER
        }).select('name email createdAt').lean();

        res.json({ teachers });
    } catch (e) {
        next(e);
    }
};


// For institution admin to remove a teacher from the institution
export const removeTeacher = async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        const institutionAdmin = await User.findById(req.user.id);
        const institutionId = institutionAdmin.institution;

        // Pull teacher from institution's array
        await Institution.findByIdAndUpdate(institutionId, {
            $pull: { teachers: teacherId }
        });

        // Optional: Decide whether to delete the user account entirely or just unlink it.
        // For now, we just unlink by removing the institution reference.
        // A more robust system might deactivate them.
        await User.findByIdAndUpdate(teacherId, {
            $unset: { institution: "", institutionalRole: "" },
        });

        res.status(200).json({ message: "Teacher removed from institution successfully." });

    } catch (e) {
        next(e);
    }
};


// For a logged-in teacher to see their specific dashboard
export const getTeacherDashboard = async (req, res, next) => {
    try {
        // Teacher-specific dashboard logic will go here.
        // For example, fetching their assigned sections, tests they've created, etc.
        const teacherId = req.user.id;
        const teacher = await User.findById(teacherId).populate('section');
        
        // Placeholder response
        res.json({ 
            message: `Welcome to your dashboard, ${teacher.name}!`,
            sections: teacher.section, // This would be populated with section data
        });
    } catch(e) {
        next(e);
    }
};

    