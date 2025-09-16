
import Institution from "../models/Institution.js";
import User from "../models/User.js";
import { ROLES } from "../utils/roles.js";

// For super admin to create a new institution and its admin
export const createInstitution = async (req, res, next) => {
    try {
        const {
            institutionName,
            institutionType,
            businessType,
            province,
            city,
            adminName,
            adminEmail,
            password
        } = req.body;

        // Check if an institution with the same name already exists
        const existingInstitution = await Institution.findOne({ name: institutionName });
        if (existingInstitution) {
            return res.status(409).json({ message: "An institution with this name already exists." });
        }

        // Check if the admin email is already in use
        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            return res.status(409).json({ message: "This email is already registered." });
        }

        // Create the user for the institution admin
        const newAdmin = await User.create({
            name: adminName,
            email: adminEmail,
            password: password,
            role: ROLES.INSTITUTION_ADMIN, // This is their primary role for auth middleware
            institutionalRole: ROLES.INSTITUTION_ADMIN,
        });

        // Create the institution
        const newInstitution = await Institution.create({
            name: institutionName,
            institutionType,
            businessType,
            province,
            city,
            admin: newAdmin._id,
        });
        
        // Link the institution back to the user
        newAdmin.institution = newInstitution._id;
        await newAdmin.save();

        res.status(201).json({
            message: "Institution and admin account created successfully.",
            institution: newInstitution,
        });

    } catch (e) {
        next(e);
    }
};


// For super admin to see all institutions
export const listInstitutions = async (req, res, next) => {
    try {
        const institutions = await Institution.find().populate('admin', 'name email').lean();
        res.json({ institutions });
    } catch (e) {
        next(e);
    }
};

export const getDashboard = async (req, res) => {
    // getDashboard logic for institution admin
};
