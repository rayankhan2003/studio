
const mongoose = require('mongoose');

// Represents a curriculum like 'MDCAT' or 'A-Level'
const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'MDCAT', 'A-Level Physics'
  description: { type: String },
  subjects: [{
    name: { type: String, required: true }, // e.g., 'Biology'
    chapters: [{
        name: { type: String, required: true } // e.g., 'Bioenergetics'
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
