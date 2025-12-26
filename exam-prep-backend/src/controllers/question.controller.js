
import Question from "../models/Question.js";

export const createQuestion = async (req, res, next) => {
  try {
    const q = await Question.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ question: q });
  } catch (e) { next(e); }
};

export const listQuestions = async (req, res, next) => {
  try {
    const { level, subject, chapter, search } = req.query;
    const filter = {};
    if (level) filter.level = level;
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (search) filter.text = { $regex: search, $options: "i" };
    const items = await Question.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (e) { next(e); }
};

export const updateQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;
        // In a real app, you might want to check if the user is the creator or an admin
        const updatedQuestion = await Question.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedQuestion) {
            return res.status(404).json({ message: "Question not found." });
        }
        res.json({ question: updatedQuestion });
    } catch (e) {
        next(e);
    }
};

export const deleteQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedQuestion = await Question.findByIdAndDelete(id);
        if (!deletedQuestion) {
            return res.status(404).json({ message: "Question not found." });
        }
        res.status(200).json({ message: "Question deleted successfully." });
    } catch (e) {
        next(e);
    }
};
