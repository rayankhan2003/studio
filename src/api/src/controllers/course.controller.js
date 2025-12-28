
import Course from "../models/Course.js";

export const getCourses = async (_req, res, next) => {
  try {
    const courses = await Course.find().lean();
    res.json({ courses });
  } catch (e) { next(e); }
};

export const upsertCourse = async (req, res, next) => {
  try {
    const { level, subjects } = req.body;
    const course = await Course.findOneAndUpdate(
      { level },
      { level, subjects },
      { upsert: true, new: true }
    );
    res.json({ course });
  } catch (e) { next(e); }
};
