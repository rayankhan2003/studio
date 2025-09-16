

import Section from "../models/Section.js";
import User from "../models/User.js";

// For institution admin to create a new section
export const createSection = async (req, res, next) => {
    try {
        const { name, subjects, teachers } = req.body;
        const institutionAdmin = await User.findById(req.user.id);

        if (!institutionAdmin.institution) {
            return res.status(400).json({ message: "Admin is not associated with any institution." });
        }

        const section = await Section.create({
            name,
            institution: institutionAdmin.institution,
            subjects: subjects || [],
            teachers: teachers || [],
        });

        res.status(201).json({ message: "Section created successfully.", section });
    } catch (e) {
        next(e);
    }
};

// For institution admin/teacher to list all sections in their institution
export const listSections = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const institutionId = user.institution;

        const sections = await Section.find({ institution: institutionId })
            .populate('teachers', 'name email')
            .lean();

        res.json({ sections });
    } catch (e) {
        next(e);
    }
};

// For institution admin to update a section
export const updateSection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, subjects, teachers } = req.body;
        const user = await User.findById(req.user.id);

        const updatedSection = await Section.findOneAndUpdate(
            { _id: id, institution: user.institution },
            { name, subjects, teachers },
            { new: true }
        );

        if (!updatedSection) {
            return res.status(404).json({ message: "Section not found or you do not have permission to edit it." });
        }

        res.json({ message: "Section updated successfully.", section: updatedSection });
    } catch (e) {
        next(e);
    }
};

// For institution admin to delete a section
export const deleteSection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);

        const deletedSection = await Section.findOneAndDelete({
            _id: id,
            institution: user.institution
        });

        if (!deletedSection) {
            return res.status(404).json({ message: "Section not found or you do not have permission to delete it." });
        }
        
        // Optional: Add logic here to unlink students from the deleted section if needed.
        // await User.updateMany({ section: id }, { $unset: { section: "" } });

        res.status(200).json({ message: "Section deleted successfully." });
    } catch (e) {
        next(e);
    }
};
