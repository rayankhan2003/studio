
import Test from "../models/Test.js";
import Question from "../models/Question.js";
import User from "../models/User.js";

export const createTest = async (req, res, next) => {
  try {
    const { 
      title, 
      level, 
      subject, 
      chapterFilter = [],
      difficulty = [],
      questionCount = 20, 
      durationMin = 30,
      section, // for assigning test to a section
    } = req.body;

    const user = await User.findById(req.user.id);

    const filter = { level, subject };
    if (chapterFilter.length) filter.chapter = { $in: chapterFilter };
    if (difficulty.length) filter.difficulty = { $in: difficulty };

    const questions = await Question.aggregate([
        { $match: filter },
        { $sample: { size: Number(questionCount) } }
    ]);

    if (questions.length < questionCount) {
        return res.status(400).json({ message: `Not enough questions found for the selected criteria. Found only ${questions.length}.` });
    }

    const questionIds = questions.map(q => q._id);

    const test = await Test.create({
      title,
      level,
      subject,
      chapterFilter,
      difficulty,
      durationMin,
      questionIds: questionIds,
      createdBy: user._id,
      institution: user.institution, // Teacher is linked to an institution
      section,
    });

    res.status(201).json({ test });
  } catch (e) {
    next(e);
  }
};

export const getTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id).populate("questionIds").lean();
    if (!test) return res.status(404).json({ message: "Not found" });

    // In a real scenario, you'd check if the user (student/teacher) has access to this test
    // based on their institution and section.

    res.json({ test });
  } catch (e) {
    next(e);
  }
};

export const getTestsForTeacher = async (req, res, next) => {
    try {
        const tests = await Test.find({ createdBy: req.user.id })
            .populate('section', 'name')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ tests });
    } catch (e) {
        next(e);
    }
};

export const getTestsForStudent = async (req, res, next) => {
    try {
        const student = await User.findById(req.user.id);
        if (!student || !student.section) {
            return res.json({ tests: [] });
        }
        const tests = await Test.find({ section: student.section, isPublished: true })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ tests });
    } catch (e) {
        next(e);
    }
};


export const publishTest = async (req, res, next) => {
  try {
    const test = await Test.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user.id }, // Ensure teacher owns the test
        { isPublished: true }, 
        { new: true }
    );
    if (!test) return res.status(404).json({ message: "Test not found or you don't have permission to publish it." });
    res.json({ test });
  } catch (e) {
    next(e);
  }
};

export const updateTest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const test = await Test.findOneAndUpdate(
            { _id: id, createdBy: req.user.id },
            req.body,
            { new: true }
        );
         if (!test) return res.status(404).json({ message: "Test not found or you don't have permission to update it." });
        res.json({ test });
    } catch(e) {
        next(e);
    }
};

export const deleteTest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const test = await Test.findOneAndDelete({ _id: id, createdBy: req.user.id });
        if (!test) return res.status(404).json({ message: "Test not found or you don't have permission to delete it." });
        
        // Also need to delete associated attempts, etc. in a real app
        // await Attempt.deleteMany({ test: id });

        res.status(200).json({ message: "Test deleted successfully." });
    } catch(e) {
        next(e);
    }
};

export const getTestForPreview = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Allow teacher to preview the test they created.
    const test = await Test.findOne({ _id: id, createdBy: req.user.id }).populate('questionIds').lean();

    if (!test) {
      return res.status(404).json({ message: 'Test not found or you do not have access.' });
    }
    res.json({ test });
  } catch (e) {
    next(e);
  }
};
