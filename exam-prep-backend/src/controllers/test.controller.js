
import Test from "../models/Test.js";
import Question from "../models/Question.js";

export const createTest = async (req, res, next) => {
  try {
    const { title, level, subject, chapterFilter = [], durationMin = 30, size = 20 } = req.body;

    // auto-pick questions if not supplied
    const filter = { level, subject };
    if (chapterFilter.length) filter.chapter = { $in: chapterFilter };

    const qIds = (await Question.find(filter).select("_id").limit(size)).map(q => q._id);

    const test = await Test.create({
      title, level, subject, chapterFilter, durationMin,
      questionIds: qIds,
      createdBy: req.user.id
    });

    res.status(201).json({ test });
  } catch (e) { next(e); }
};

export const getTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id).populate("questionIds").lean();
    if (!test) return res.status(404).json({ message: "Not found" });
    res.json({ test });
  } catch (e) { next(e); }
};

export const publishTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, { isPublished: true }, { new: true });
    res.json({ test });
  } catch (e) { next(e); }
};
